export type AppTheme = {
    // Base Colors
    background: string;
    surface: string;
    text: string;
    mutedText: string;
    placeholder: string;

    // Borders
    border: string;
    borderLight: string;

    // Primary / Accent Colors
    primary: string;
    primaryLight: string;
    secondary: string;
    secondaryLight: string;


    // Status / Feedback Colors
    success: string;
    warning: string;
    error: string;
    info: string;

    // Buttons
    buttonBackground: string;
    buttonText: string;
    buttonTextSecondary: string;
    buttonBorder: string;

    // Inputs
    inputBackground: string;
    inputText: string;
    inputBorder: string;
    inputFocusBorder: string;

    // Modals / Overlays
    overlay: string;
    modalBackground: string;

    // Tabs / Navigation
    tabBarBackground: string;
    tabBarIconActive: string;
    tabBarIconInactive: string;

    // Misc
    shadowColor: string;
    cardBackground: string;
    rippleColor: string;

    // System
    isDark: boolean;



    senderBackground: string;
    receiverBackground: string;

    senderText: string;
    receiverText: string;
};

export const lightTheme: AppTheme = {
    background: '#FFFFFF',
    surface: '#F6F6F6',
    text: '#000000',
    mutedText: '#6B7280',
    placeholder: '#9CA3AF',

    border: '#E5E7EB',
    borderLight: '#F3F4F6',

    primary: '#007AFF',
    primaryLight: '#339DFF',
    secondary: '#FF9500',
    secondaryLight: '#FFC078',

    success: '#34C759',
    warning: '#FFCC00',
    error: '#FF3B30',
    info: '#5AC8FA',

    buttonBackground: '#007AFF',
    buttonText: '#121212',
    buttonTextSecondary: '#FFFFFF',
    buttonBorder: '#007AFF',

    inputBackground: '#F9FAFB',
    inputText: '#121212',
    inputBorder: '#D1D5DB',
    inputFocusBorder: '#007AFF',

    overlay: 'rgba(0, 0, 0, 0.3)',
    modalBackground: '#FFFFFF',

    tabBarBackground: 'rgba(0, 0, 0, 0.1)',
    tabBarIconActive: '#007AFF',
    tabBarIconInactive: '#A0AEC0',

    shadowColor: '#000000',
    cardBackground: '#FFFFFF',
    rippleColor: 'rgba(0, 0, 0, 0.1)',

    isDark: false,

    senderBackground: '#F9FAFB',
    receiverBackground: '#F9FAFB',

    senderText: '#121212',
    receiverText: '#121212',
};

export const darkTheme: AppTheme = {
    background: '#121212',
    surface: '#121212',
    text: '#FFFFFF',
    mutedText: '#9CA3AF',
    placeholder: '#6B7280',

    border: '#2D2D2D',
    borderLight: '#3A3A3A',

    primary: '#0A84FF',
    primaryLight: '#4FA5FF',
    secondary: '#FF9F0A',
    secondaryLight: '#FFD580',

    success: '#32D74B',
    warning: '#FFD60A',
    error: '#FF453A',
    info: '#64D2FF',

    buttonBackground: '#0A84FF',
    buttonText: '#FFFFFF',
    buttonTextSecondary: '#121212',
    buttonBorder: '#0A84FF',

    inputBackground: '#1C1C1E',
    inputText: '#FFFFFF',
    inputBorder: '#2C2C2E',
    inputFocusBorder: '#0A84FF',

    overlay: 'rgba(255, 255, 255, 0.2)',
    modalBackground: '#1C1C1E',

    tabBarBackground: '#242424',
    tabBarIconActive: '#0A84FF',
    tabBarIconInactive: '#7C7C7C',

    shadowColor: '#000000',
    cardBackground: '#1E1E1E',
    rippleColor: 'rgba(255, 255, 255, 0.1)',

    isDark: true,



    senderBackground: '#1C1C1E',
    receiverBackground: '#F9FAFB',

    senderText: '#FFFFFF',
    receiverText: '#121212',
};
