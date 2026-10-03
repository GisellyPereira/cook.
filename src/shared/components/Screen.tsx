import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { contentWidth } from '../theme/tokens';

const Screen = React.forwardRef<ScrollView, { children: React.ReactNode }>(
  function ScreenContent({ children }, ref) {
    return (
      <ScrollView
        ref={ref}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>{children}</View>
      </ScrollView>
    );
  },
);
export default Screen;
const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  content: {
    width: '100%',
    maxWidth: contentWidth,
    alignSelf: 'center',
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 30,
    gap: 24,
  },
});
