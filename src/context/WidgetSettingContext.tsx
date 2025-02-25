import { SendbirdChatWith } from '@sendbird/chat';
import { GroupChannelModule } from '@sendbird/chat/groupChannel';
import React, {
  createContext,
  useContext,
  useLayoutEffect,
  useState,
} from 'react';

import { useConstantState } from './ConstantContext';
import { widgetSettingHandler } from '../libs/api/widgetSetting';
import {
  getWidgetSessionCache,
  saveWidgetSessionCache,
  WidgetSessionCache,
} from '../libs/storage/widgetSessionCache';
import { getDateNDaysLater, isPastTime } from '../utils';

interface WidgetSession {
  strategy: 'auto' | 'manual';
  userId: string;
  expireAt: number;
  // channelUrl is optional and is dynamically generated for a legacy manual strategy.
  channelUrl?: string;
  // sessionToken is optional and is dynamically generated by configureSession provided by the user for a manual strategy.
  sessionToken?: string;
}

export interface BotStyle {
  theme: 'light' | 'dark';
  accentColor: string;
  botMessageBGColor: string;
  /** @deprecated We no longer use the autoOpen value from the dashboard. **/
  autoOpen: boolean;
}

export interface BotConfigs {
  allowImageProcessing: boolean;
}

type Context = {
  initialized: boolean;
  botStyle: BotStyle;
  botConfigs: BotConfigs;
  widgetSession: WidgetSession | null;
  initManualSession: (sdk: SendbirdChatWith<[GroupChannelModule]>) => void;
  resetSession: () => Promise<void>;
};

const WidgetSettingContext = createContext<Context | null>(null);
export const WidgetSettingProvider = ({
  children,
}: React.PropsWithChildren) => {
  const {
    applicationId: appId,
    botId,
    apiHost,
    userId: injectedUserId,
    sessionToken,
    configureSession,
    createGroupChannelParams,
    firstMessageData,
    botStudioEditProps,
  } = useConstantState();

  if (!appId || !botId) {
    throw new Error('applicationId or botId is not defined');
  }

  const sessionStrategy: 'auto' | 'manual' =
    typeof configureSession === 'function' && !!injectedUserId && !!sessionToken
      ? 'manual'
      : 'auto';

  const inProgress = React.useRef(false);
  const [initialized, setInitialized] = useState(false);
  const [botStyle, setBotStyle] = useState<BotStyle>({
    theme: 'light',
    accentColor: '#742DDD',
    botMessageBGColor: '#EEEEEE',
    autoOpen: false,
  });
  const [botConfigs, setBotConfigs] = useState<BotConfigs>({
    allowImageProcessing: false,
  });
  const [widgetSession, setWidgetSession] = useState<WidgetSession | null>(
    null
  );

  async function initSessionByStrategy(
    strategy: 'auto' | 'manual',
    clearCache = false
  ) {
    const cachedSession = getWidgetSessionCache({
      appId,
      botId,
    });

    const useCachedSession = ((
      cache: typeof cachedSession
    ): cache is NonNullable<typeof cachedSession> => {
      if (clearCache) return false;
      if (!cache || cache.strategy !== strategy) return false;
      if (cache.strategy === 'manual') {
        // NOTE: There is no need to check the expiration of the session if it is managed manually.
        // However, since the existing logic has been regenerating the channel every 30 days due to this logic.
        return !isPastTime(cache.expireAt) && cache.userId === injectedUserId;
      }
      if (cache.strategy === 'auto') {
        return !isPastTime(cache.expireAt);
      }
      return false;
    })(cachedSession);

    await widgetSettingHandler(strategy, useCachedSession, {
      host: apiHost,
      appId,
      botId,
      userId: strategy === 'manual' ? injectedUserId : cachedSession?.userId,
    })
      .onGetConfigs((configs) => setBotConfigs(configs))
      .onGetBotStyle((style) => setBotStyle(style))
      .onAutoNonCached(({ user, channel }) => {
        const session = {
          strategy,
          userId: user.userId,
          sessionToken: user.sessionToken,
          expireAt: user.expireAt,
          channelUrl: channel.channelUrl,
        } satisfies WidgetSessionCache;
        setWidgetSession(session);
        saveWidgetSessionCache({ appId, botId, data: session });
      })
      .onAutoCached(({ channel }) => {
        if (cachedSession) {
          const session = {
            ...cachedSession,
            channelUrl: channel?.channelUrl ?? cachedSession.channelUrl,
          } satisfies WidgetSessionCache;
          setWidgetSession(session);
          saveWidgetSessionCache({ appId, botId, data: session });
        }
      })
      .onManualNonCached(() => {
        if (injectedUserId) {
          // if (response) {
          //   const session = { strategy, userId: injectedUserId, channelUrl: response.channel?.channelUrl, expireAt: getDateNDaysLater(30) } satisfies WidgetSessionCache;
          //   setWidgetSession({ ...session, sessionToken });
          //   saveWidgetSessionCache({ appId, botId, data: session });
          // }
          /**
           * NOTE: [Legacy manual] We don't fully initialize the manual strategy session here.
           * After the uikit is initialized, we should call the `initManualSession` function.
           * */
          const session = {
            strategy,
            userId: injectedUserId,
            sessionToken,
            channelUrl: undefined,
            expireAt: 0,
          } satisfies WidgetSession;
          setWidgetSession(session);
        }
      })
      .onManualCached(({ channel }) => {
        if (cachedSession) {
          const session = {
            ...cachedSession,
            channelUrl: channel?.channelUrl ?? cachedSession.channelUrl,
          } satisfies WidgetSessionCache;
          setWidgetSession({ ...session, sessionToken });
          saveWidgetSessionCache({ appId, botId, data: session });
        }
      })
      .get();

    setInitialized(true);
  }

  async function initManualSession(
    sdk: SendbirdChatWith<[GroupChannelModule]>
  ) {
    if (sessionStrategy === 'manual' && injectedUserId) {
      const data = firstMessageData
        ? JSON.stringify({ first_message_data: firstMessageData })
        : undefined;

      const channel = await sdk.groupChannel.createChannel({
        name: createGroupChannelParams.name ?? 'AI Chatbot Widget Channel',
        coverUrl: createGroupChannelParams.coverUrl,
        invitedUserIds: [injectedUserId, botId],
        isDistinct: false,
        data,
      });

      const session = {
        strategy: sessionStrategy,
        expireAt: getDateNDaysLater(30),
        userId: injectedUserId,
        channelUrl: channel.url,
      };
      setWidgetSession((prev) => ({ ...prev, ...session }));
      saveWidgetSessionCache({ appId, botId, data: session });
    }
  }

  useLayoutEffect(() => {
    // Trick to prevent duplicated request in strict mode.
    if (inProgress.current) return;
    inProgress.current = true;
    initSessionByStrategy(sessionStrategy).finally(() => {
      inProgress.current = false;
    });
  }, [sessionStrategy]);

  return (
    <WidgetSettingContext.Provider
      value={{
        initialized,
        botStyle: {
          ...botStyle,
          ...botStudioEditProps?.styles,
          accentColor:
            botStudioEditProps?.styles?.accentColor ??
            botStudioEditProps?.styles?.primaryColor ??
            botStyle.accentColor,
        },
        botConfigs,
        widgetSession,
        initManualSession,
        resetSession: () => initSessionByStrategy(sessionStrategy, true),
      }}
    >
      {widgetSession ? children : null}
    </WidgetSettingContext.Provider>
  );
};

export const useWidgetSetting = () => {
  const context = useContext(WidgetSettingContext);
  if (!context) {
    throw new Error(
      'Not found WidgetSettingContext, useWidgetSetting must be used within an WidgetSettingProvider'
    );
  }
  return context;
};

export const useWidgetSession = () => {
  const { widgetSession } = useWidgetSetting();
  if (!widgetSession) {
    throw new Error(
      "WidgetSession is not initialized. Please make sure to use useWidgetSession under the WidgetSettingProvider's children components."
    );
  }
  return widgetSession;
};
