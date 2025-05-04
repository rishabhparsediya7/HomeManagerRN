import React, {useRef, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import Icons from '../../components/icons';
const slides = [
  {
    id: '1',
    title: 'Track Your Money',
    description: 'Keep track of your expenses and stay on top of your finances',
    image: <Icons.WalletIcon />, // replace with your actual image path
  },
  {
    id: '2',
    title: 'Smart Analytics',
    description:
      'Get detailed insights about your spending habits with beautiful charts',
    image: <Icons.ChartIcon />,
  },
  {
    id: '3',
    title: 'Ready to Start',
    description:
      'Create your first expense entry and begin your journey to financial wellness',
    image: <Icons.CheckIcon />,
  },
];

const OnboardingScreen = ({navigation}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const {width} = useWindowDimensions();

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef?.current?.scrollToIndex({index: currentIndex + 1});
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
      <View style={styles.imageContainer}>{item.image}</View>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
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
        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>
            {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  buttonContainer: {
    paddingHorizontal: 16,
    width: '100%',
  },
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  imageContainer: {
    backgroundColor: '#f0f6ff',
    borderRadius: 100,
    padding: 40,
    marginBottom: 30,
  },
  image: {
    width: 80,
    height: 80,
    tintColor: '#3366FF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111',
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  pagination: {
    flexDirection: 'row',
    marginBottom: 20,
    marginTop: 10,
  },
  dot: {
    height: 8,
    width: 8,
    borderRadius: 4,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 5,
  },
  dotActive: {
    backgroundColor: '#3366FF',
  },
  button: {
    width: '100%',
    backgroundColor: '#3366FF',
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
