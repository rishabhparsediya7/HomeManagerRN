import React, {useMemo, useRef, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  useWindowDimensions,
  StatusBar,
} from 'react-native';
import Icons from '../../components/icons';
import {useTheme} from '../../providers/ThemeContext';
import {darkTheme, lightTheme} from '../../providers/Theme';
import Button from '../../components/Button';
import {commonStyles} from '../../utils/styles';

const slides = [
  {
    id: '1',
    title: 'Track Your Money',
    description: 'Keep track of your expenses and stay on top of your finances',
    IconComponent: Icons.WalletIcon,
  },
  {
    id: '2',
    title: 'Smart Analytics',
    description:
      'Get detailed insights about your spending habits with beautiful charts',
    IconComponent: Icons.ChartIcon,
  },
  {
    id: '3',
    title: 'Ready to Start',
    description:
      'Create your first expense entry and begin your journey to financial wellness',
    IconComponent: Icons.CheckIcon,
  },
];

const OnboardingScreen = ({navigation}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const {width} = useWindowDimensions();
  const {theme} = useTheme();
  const colors = theme === 'dark' ? darkTheme : lightTheme;

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef?.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      navigation.navigate('SignIn');
    }
  };

  const updateCurrentIndex = e => {
    const contentOffsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    setCurrentIndex(index);
  };

  const renderItem = ({item}) => (
    <View style={[styles.slide, {width}]}>
      <View style={styles.imageContainer}>
        <item.IconComponent width={120} height={120} color={colors.primary} />
      </View>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          alignItems: 'center',
          paddingTop: 0,
        },
        buttonContainer: {
          paddingHorizontal: 24,
          width: '100%',
          marginBottom: 32,
        },
        slide: {
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          paddingHorizontal: 20,
        },
        imageContainer: {
          backgroundColor: colors.primaryLight,
          borderRadius: 100,
          padding: 40,
          marginBottom: 40,
          shadowColor: colors.primary,
          shadowOffset: {width: 0, height: 10},
          shadowOpacity: 0.1,
          shadowRadius: 20,
          elevation: 5,
        },
        title: {
          ...commonStyles.textExtraBold,
          fontSize: 28,
          color: '#000000',
          textAlign: 'center',
          marginBottom: 16,
        },
        description: {
          ...commonStyles.textMedium,
          fontSize: 16,
          lineHeight: 24,
          color: colors.mutedText,
          textAlign: 'center',
          paddingHorizontal: 10,
        },
        pagination: {
          flexDirection: 'row',
          marginBottom: 32,
          marginTop: 16,
          justifyContent: 'center',
        },
        dot: {
          height: 8,
          width: 8,
          borderRadius: 4,
          backgroundColor: colors.border,
          marginHorizontal: 6,
        },
        dotActive: {
          backgroundColor: colors.primary,
          width: 24,
        },
      }),
    [theme],
  );

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor="transparent"
        translucent
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
      />
      <View style={{flex: 1, width: '100%', backgroundColor: 'white'}}>
        <FlatList
          data={slides}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          bounces={false}
          onScroll={updateCurrentIndex}
          ref={flatListRef}
          scrollEventThrottle={16}
        />

        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, currentIndex === index && styles.dotActive]}
            />
          ))}
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title={currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
            onPress={handleNext}
          />
        </View>
      </View>
    </View>
  );
};

export default OnboardingScreen;
