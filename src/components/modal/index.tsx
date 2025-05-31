import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetFooter,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import React, {useCallback} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {useReducedMotion} from 'react-native-reanimated';
import {
  initialWindowMetrics,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Header from '../../components/Header';

interface ModalProps {
  isBottomSheetNonDismissible?: boolean;
  bottomSheetRef: React.RefObject<BottomSheetModal | null>;
  modalSnapPoints: Array<string>;
  children: React.ReactNode;
  bottomSheetIndex?: number;
  footerComponent?: React.ReactNode;
  headerTitle?: string;
  onCrossPress?: () => void;
  variant?: 'scrollableModal';
}
export const Modal = ({
  isBottomSheetNonDismissible = false,
  bottomSheetRef,
  modalSnapPoints = ['35%'],
  children,
  bottomSheetIndex,
  footerComponent,
  headerTitle,
  onCrossPress,
  variant,
  ...rest
}: ModalProps) => {
  const insets =
    Platform.OS == 'android'
      ? useSafeAreaInsets()
      : initialWindowMetrics?.insets || {top: 0, bottom: 0, right: 0, left: 0};

  const handleClose = () => {
    if (isBottomSheetNonDismissible === false) {
      bottomSheetRef.current?.dismiss();
    }
  };
  const reducedMotion = useReducedMotion();
  const renderBackdrop = useCallback((props: BottomSheetBackdropProps) => {
    return (
      <BottomSheetBackdrop
        {...props}
        onPress={handleClose}
        pressBehavior={isBottomSheetNonDismissible ? 'none' : 'close'}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
      />
    );
  }, []);
  const onChange = () => {};

  switch (variant) {
    case 'scrollableModal': {
      return (
        <>
          <BottomSheetModal
            backdropComponent={renderBackdrop}
            onChange={onChange}
            ref={bottomSheetRef}
            enablePanDownToClose
            snapPoints={modalSnapPoints}
            onDismiss={handleClose}
            android_keyboardInputMode="adjustPan"
            keyboardBlurBehavior="restore"
            topInset={insets.top}
            animateOnMount={!reducedMotion}
            index={bottomSheetIndex}
            handleComponent={() => (
              <Header
                title={headerTitle}
                showCrossButton
                onCrossPress={onCrossPress}
                headerStyle={styles.header}
              />
            )}
            {...rest}
            // footerComponent={renderFooter}
          >
            <BottomSheetScrollView
              showsVerticalScrollIndicator={false}
              style={styles.bottomPadding}>
              <View
                style={[styles.bottomPadding, styles.viewModalContainer]}
                testID={'modal'}>
                {children}
              </View>
            </BottomSheetScrollView>
          </BottomSheetModal>
        </>
      );
    }

    default: {
      return (
        <BottomSheetModal
          backdropComponent={renderBackdrop}
          onChange={onChange}
          ref={bottomSheetRef}
          enablePanDownToClose
          snapPoints={modalSnapPoints}
          android_keyboardInputMode="adjustResize"
          keyboardBlurBehavior="restore"
          topInset={insets.top}
          animateOnMount={!reducedMotion}
          enableContentPanningGesture={false}
          onDismiss={handleClose}
          index={bottomSheetIndex}
          handleComponent={() => (
            <Header
              title={headerTitle}
              showCrossButton
              onCrossPress={onCrossPress}
              headerStyle={styles.header}
            />
          )}
          {...rest}>
          <BottomSheetView style={styles.contentContainer}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={styles.keyboardAvoidingView}
              keyboardVerticalOffset={
                Platform.OS === 'ios' ? insets.top + 60 : 0
              } // Adjust for header
            >
              <ScrollView
                contentContainerStyle={styles.scrollContainer}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}>
                <View
                  style={[styles.bottomPadding, styles.viewModalContainer]}
                  testID={'modal'}>
                  {children}
                </View>
              </ScrollView>
            </KeyboardAvoidingView>
          </BottomSheetView>
        </BottomSheetModal>
      );
    }
  }
};

const styles = StyleSheet.create({
  bottomPadding: {
    paddingBottom: 16,
  },

  keyboardAvoidingView: {
    flex: 1,
    width: '100%',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    width: '100%',
  },

  viewModalContainer: {
    flex: 1,
    backgroundColor: '#fff',
    width: '100%',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
  },
  header: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
});
