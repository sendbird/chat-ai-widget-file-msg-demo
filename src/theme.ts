import { getColorBasedOnSaturation, generateColorVariants } from './colors';
export interface CommonTheme {
  bgColor: {
    chatBottom: string;
    messageInput: string;
    incomingMessage: string;
    outgoingMessage: string;
    suggestedReply: string;
    bottomBanner: string;
    loadingScreen: string;
    hover: {
      incomingMessage: string;
      outgoingMessage: string;
      suggestedReply: string;
      carouselButton: string;
    };
    carouselItem: string;
    carouselButton: string;
    carouselButtonIcon: string;
  };
  textColor: {
    incomingMessage: string;
    outgoingMessage: string;
    errorMessage: string;
    sentTime: string;
    sourceInfo: string;
    suggestedReply: string;
    bottomBanner: {
      poweredBy: string;
      logo: string;
    };
    carouselItem: string;
  };
  borderColor: {
    channelHeader: string;
    carouselItem: string;
  };
  accentColor: string;
}
interface Theme {
  light: CommonTheme;
  dark: CommonTheme;
}

export function getTheme({
  accentColor,
  botMessageBGColor,
}: {
  accentColor?: string;
  botMessageBGColor?: string;
}): Theme {
  return {
    light: {
      bgColor: {
        chatBottom: 'var(--sendbird-light-background-50)',
        messageInput: 'var(--sendbird-light-background-100)',
        incomingMessage:
          botMessageBGColor ?? 'var(--sendbird-dark-background-100)',
        outgoingMessage: accentColor ?? 'var(--sendbird-light-primary-300)',
        suggestedReply: 'var(--sendbird-light-background-50)',
        bottomBanner: 'var(--sendbird-light-background-50)',
        loadingScreen: 'var(--sendbird-light-background-50)',
        hover: {
          // Give 1 level darker color for hover
          incomingMessage: botMessageBGColor
            ? generateColorVariants(botMessageBGColor)[400]
            : 'var(--sendbird-light-background-200)',
          outgoingMessage: accentColor
            ? generateColorVariants(accentColor)[400]
            : 'var(--sendbird-light-primary-400)',
          suggestedReply: 'var(--sendbird-light-background-100)',
          carouselButton: 'var(--sendbird-light-background-100)',
        },
        carouselItem: 'var(--sendbird-light-background-50)',
        carouselButton: 'var(--sendbird-light-background-50)',
        carouselButtonIcon: 'var(--sendbird-light-background-400)',
      },
      textColor: {
        incomingMessage: botMessageBGColor
          ? getColorBasedOnSaturation(botMessageBGColor)
          : 'var(--sendbird-dark-onlight-01)',
        outgoingMessage: accentColor
          ? getColorBasedOnSaturation(accentColor)
          : 'var(--sendbird-light-ondark-01)',
        errorMessage: 'var(--sendbird-dark-onlight-01)',
        sentTime: 'var(--sendbird-dark-onlight-03)',
        sourceInfo: 'var(--sendbird-light-ondark-01)',
        suggestedReply: accentColor ?? 'var(--sendbird-light-primary-300)',
        bottomBanner: {
          poweredBy: '#5E5E5E',
          logo: '#0D0D0D',
        },
        carouselItem: 'var(--sendbird-light-onlight-01)',
      },
      borderColor: {
        channelHeader: 'var(--sendbird-light-onlight-04)',
        carouselItem: 'var(--sendbird-light-onlight-04)',
      },
      accentColor: accentColor ?? 'var(--sendbird-light-primary-300)',
    },
    dark: {
      bgColor: {
        chatBottom: 'var(--sendbird-dark-background-600)',
        messageInput: 'var(--sendbird-dark-background-500)',
        incomingMessage:
          botMessageBGColor ?? 'var(--sendbird-dark-background-500)',
        outgoingMessage: accentColor ?? 'var(--sendbird-dark-primary-200)',
        suggestedReply: 'var(--sendbird-dark-background-600)',
        bottomBanner: 'var(--sendbird-dark-background-600)',
        loadingScreen: 'var(--sendbird-dark-background-600)',
        hover: {
          // Give 1 level lighter color for hover
          incomingMessage: botMessageBGColor
            ? generateColorVariants(botMessageBGColor)[200]
            : 'var(--sendbird-dark-background-400)',
          // Give 1 level darker color for hover
          outgoingMessage: accentColor
            ? generateColorVariants(accentColor)[400]
            : 'var(--sendbird-dark-primary-300)',
          suggestedReply: 'var(--sendbird-dark-background-500)',
          carouselButton: 'var(--sendbird-dark-background-500)',
        },
        carouselItem: 'var(--sendbird-dark-background-500)',
        carouselButton: 'var(--sendbird-dark-background-400)',
        carouselButtonIcon: 'var(--sendbird-dark-background-50)',
      },
      textColor: {
        outgoingMessage: accentColor
          ? getColorBasedOnSaturation(accentColor)
          : 'var(--sendbird-dark-onlight-01)',
        incomingMessage: botMessageBGColor
          ? getColorBasedOnSaturation(botMessageBGColor)
          : 'var(--sendbird-dark-ondark-01)',
        errorMessage: 'var(--sendbird-dark-ondark-01)',
        sentTime: 'var(--sendbird-dark-ondark-03)',
        sourceInfo: 'var(--sendbird-light-ondark-01)',
        suggestedReply: accentColor ?? 'var(--sendbird-dark-primary-200)',
        bottomBanner: {
          poweredBy: 'var(--sendbird-dark-background-200)',
          logo: 'var(--sendbird-dark-background-50)',
        },
        carouselItem: 'var(--sendbird-dark-ondark-01)',
      },
      borderColor: {
        channelHeader: 'var(--sendbird-dark-ondark-04)',
        carouselItem: 'var(--sendbird-dark-ondark-04)',
      },
      accentColor: accentColor ?? 'var(--sendbird-dark-primary-200)',
    },
  };
}
