import { User } from '@sendbird/chat';
import { UserMessage } from '@sendbird/chat/message';
import { Locale } from 'date-fns';
import { ReactNode } from 'react';
import styled from 'styled-components';

import Avatar from '@uikit/ui/Avatar';
import Label, { LabelColors, LabelTypography } from '@uikit/ui/Label';

import { SentTime } from './MessageComponent';
import { formatCreatedAtToAMPM } from '../utils/messageTimestamp';

const Root = styled.div`
  display: flex;
  align-items: flex-end;
  margin-bottom: 6px;
  flex-wrap: wrap;
  gap: 8px;
  position: relative;
`;

const Sender = styled(Label)`
  margin: 0 0 4px 12px;
  text-align: left;
`;

interface BodyContainerProps {
  maxWidth?: string;
}

const BodyContainer = styled.div<BodyContainerProps>`
  font-size: 14px;
  color: ${({ theme }) => theme.textColor.outgoingMessage};
  max-width: calc(100% - 96px);
  font-weight: normal;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.43;
  letter-spacing: normal;
`;

const Content = styled.div`
  display: flex;
  align-items: end;
  gap: 4px;
`;

type Props = {
  user: User;
  message: UserMessage;
  bodyComponent: ReactNode;
  chainTop?: boolean;
  chainBottom?: boolean;
  isBotWelcomeMessage?: boolean;
  isFormMessage?: boolean;
  locale?: Locale;
};

const ImageContainer = styled.div``;

const EmptyImageContainer = styled.div`
  width: 28px;
`;

export default function UserMessageWithBodyInput(props: Props) {
  const { user, message, bodyComponent, chainTop, chainBottom, locale } = props;

  const nonChainedMessage = chainTop == null && chainBottom == null;
  const displayProfileImage = nonChainedMessage || chainBottom;
  const displaySender = nonChainedMessage || chainTop;

  return (
    <Root>
      {displayProfileImage ? (
        <ImageContainer>
          <Avatar height="28px" width="28px" src={user?.profileUrl} />
        </ImageContainer>
      ) : (
        <EmptyImageContainer />
      )}
      <BodyContainer>
        {displaySender && (
          <Sender
            type={LabelTypography.CAPTION_2}
            color={LabelColors.ONBACKGROUND_2}
          >
            {user.nickname}
          </Sender>
        )}
        <Content>
          {bodyComponent}
          {!!message?.createdAt && (
            <SentTime>
              {formatCreatedAtToAMPM(message.createdAt, locale)}
            </SentTime>
          )}
        </Content>
      </BodyContainer>
    </Root>
  );
}
