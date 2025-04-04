import { addHeader } from '../prompts';
/**
 * Provides a list of attachments in the current conversation.
 * @param {IAgentRuntime} runtime - The agent runtime object.
 * @param {Memory} message - The message memory object.
 * @returns {Object} The attachments values, data, and text.
 */
export const attachmentsProvider = {
  name: 'ATTACHMENTS',
  description:
    'List of attachments sent during the current conversation, including names, descriptions, and summaries',
  dynamic: true,
  get: async (runtime, message) => {
    // Start with any attachments in the current message
    let allAttachments = message.content.attachments || [];
    const { roomId } = message;
    const conversationLength = runtime.getConversationLength();
    const recentMessagesData = await runtime.getMemories({
      roomId,
      count: conversationLength,
      unique: false,
      tableName: 'messages',
    });
    // Process attachments from recent messages
    if (recentMessagesData && Array.isArray(recentMessagesData)) {
      const lastMessageWithAttachment = recentMessagesData.find(
        (msg) => msg.content.attachments && msg.content.attachments.length > 0
      );
      if (lastMessageWithAttachment) {
        const lastMessageTime = lastMessageWithAttachment?.createdAt ?? Date.now();
        const oneHourBeforeLastMessage = lastMessageTime - 60 * 60 * 1000; // 1 hour before last message
        allAttachments = recentMessagesData.reverse().flatMap((msg) => {
          const msgTime = msg.createdAt ?? Date.now();
          const isWithinTime = msgTime >= oneHourBeforeLastMessage;
          const attachments = msg.content.attachments || [];
          if (!isWithinTime) {
            for (const attachment of attachments) {
              attachment.text = '[Hidden]';
            }
          }
          return attachments;
        });
      }
    }
    // Format attachments for display
    const formattedAttachments = allAttachments
      .map(
        (attachment) => `ID: ${attachment.id}
    Name: ${attachment.title}
    URL: ${attachment.url}
    Type: ${attachment.source}
    Description: ${attachment.description}
    Text: ${attachment.text}
    `
      )
      .join('\n');
    // Create formatted text with header
    const text =
      formattedAttachments && formattedAttachments.length > 0
        ? addHeader('# Attachments', formattedAttachments)
        : '';
    const values = {
      attachments: text,
    };
    const data = {
      attachments: allAttachments,
    };
    return {
      values,
      data,
      text,
    };
  },
};
//# sourceMappingURL=attachments.js.map
