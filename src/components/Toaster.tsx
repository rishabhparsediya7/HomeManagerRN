import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Toast from 'react-native-toast-message';
import { BaseToast, ErrorToast } from 'react-native-toast-message';
import { useTheme } from '../providers/ThemeContext';
import { darkTheme, lightTheme } from '../providers/Theme';

const Toaster = () => {
    const { theme } = useTheme();
    const colors=theme === 'dark' ? darkTheme : lightTheme;
    
    const styles = StyleSheet.create({
        toastContainer: {
            backgroundColor: colors.inputBackground,
            color: colors.inputText,
            paddingHorizontal: 15,
            borderColor: colors.inputText,
            borderRadius: 12
        },
        text1: {
            fontSize: 15,
            fontWeight: '400',
            color: colors.inputText
        }
    })

    const toastConfig = {
        success: (props: any) => (
          <BaseToast
            {...props}
            style={{ backgroundColor: colors.inputBackground, borderLeftColor: colors.primary }}
            contentContainerStyle={styles.toastContainer}
            text1Style={styles.text1}
            text2Style={styles.text1}
          />
        ),
        error: (props: any) => (
          <ErrorToast
            {...props}
            text1Style={styles.text1}
            text2Style={styles.text1}
          />
        )
      };
  return (
    <Toast config={toastConfig}/>
  )
}

export default Toaster

