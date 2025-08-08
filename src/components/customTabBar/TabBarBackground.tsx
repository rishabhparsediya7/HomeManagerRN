// components/TabBarBackground.tsx
import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { Platform, StyleSheet } from 'react-native';

type Props = {
  width: number;
  height: number;
  color: string;
};

const NOTCH_RADIUS = 42;
const TOP_Y = 20;

const TabBarBackground = ({ width, height, color }: Props) => {
  if (width === 0) return null;

  const centerX = width / 2;

  const path = `
    M 0 ${TOP_Y}
    L ${centerX - NOTCH_RADIUS} ${TOP_Y}
    A ${NOTCH_RADIUS} ${NOTCH_RADIUS} 0 0 1 ${centerX + NOTCH_RADIUS} ${TOP_Y}
    L ${width} ${TOP_Y}
    L ${width} ${height}
    L 0 ${height}
    Z
  `;

  return (
    <Svg
      width={width}
      height={height}
      style={styles.svgContainer}
    >
      <Path d={path} fill={color} />
    </Svg>
  );
};

const styles = StyleSheet.create({
    svgContainer: {
        position: 'absolute',
        bottom: 0,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 10,
            },
        }),
    },
});

export default TabBarBackground;