import React from 'react';
import { Portal, Dialog, Button, Paragraph } from 'react-native-paper';

export const AppDialog = ({ visible, onDismiss, title, content, actions = [] }: any) => {
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        {title ? <Dialog.Title>{title}</Dialog.Title> : null}
        {content ? <Dialog.Content><Paragraph>{content}</Paragraph></Dialog.Content> : null}
        <Dialog.Actions>
          {actions.map((a: any, i: number) => (
            <Button key={i} onPress={a.onPress}>
              {a.label}
            </Button>
          ))}
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};
