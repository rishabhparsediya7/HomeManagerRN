import React from 'react';
import {View, StyleSheet} from 'react-native';
import Svg, {Circle, Path} from 'react-native-svg';

interface DonutSegment {
  percentage: number;
  color: string;
}

interface DonutChartProps {
  segments: DonutSegment[];
  size?: number;
  strokeWidth?: number;
  backgroundColor?: string;
  children?: React.ReactNode;
  selectedIndex?: number | null;
  onSegmentPress?: (index: number) => void;
}

const DonutChart: React.FC<DonutChartProps> = ({
  segments,
  size = 140,
  strokeWidth = 14,
  backgroundColor = '#F3F4F6',
  children,
  selectedIndex = null,
  onSegmentPress,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  // Build segment data with cumulative offsets
  const activeSegments = segments.filter(s => Number(s.percentage) > 0);
  const gapSize = activeSegments.length > 1 ? 4 : 0;

  let cumulativePercent = 0;
  const segmentData = activeSegments.map((segment, index) => {
    const pct = Number(segment.percentage);
    const segmentLength = (pct / 100) * circumference;
    const offset =
      circumference -
      (cumulativePercent / 100) * circumference +
      circumference * 0.25;

    const startAngle = (cumulativePercent / 100) * 360 - 90;
    const endAngle = ((cumulativePercent + pct) / 100) * 360 - 90;

    cumulativePercent += pct;

    return {
      ...segment,
      percentage: pct,
      index,
      segmentLength,
      offset,
      startAngle,
      endAngle,
    };
  });

  // Create an invisible touch arc path for each segment
  const createArcPath = (startAngle: number, endAngle: number, r: number) => {
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const outerR = r;
    const innerR = r - strokeWidth;

    const x1 = center + outerR * Math.cos(startRad);
    const y1 = center + outerR * Math.sin(startRad);
    const x2 = center + outerR * Math.cos(endRad);
    const y2 = center + outerR * Math.sin(endRad);
    const x3 = center + innerR * Math.cos(endRad);
    const y3 = center + innerR * Math.sin(endRad);
    const x4 = center + innerR * Math.cos(startRad);
    const y4 = center + innerR * Math.sin(startRad);

    // Check for NaN values — bail to empty path
    if ([x1, y1, x2, y2, x3, y3, x4, y4].some(v => isNaN(v))) {
      return '';
    }

    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    return `M ${x1} ${y1} A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerR} ${innerR} 0 ${largeArc} 0 ${x4} ${y4} Z`;
  };

  return (
    <View style={[styles.container, {width: size, height: size}]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Visible segments */}
        {segmentData.map(seg => (
          <Circle
            key={seg.index}
            cx={center}
            cy={center}
            r={radius}
            stroke={seg.color}
            strokeWidth={
              selectedIndex === seg.index ? strokeWidth + 4 : strokeWidth
            }
            fill="none"
            strokeDasharray={`${Math.max(
              0,
              seg.segmentLength - gapSize,
            )} ${circumference}`}
            strokeDashoffset={seg.offset}
            strokeLinecap="round"
          />
        ))}

        {/* Invisible touch targets */}
        {onSegmentPress &&
          segmentData.map(seg => {
            const path = createArcPath(
              seg.startAngle,
              seg.endAngle,
              radius + strokeWidth / 2,
            );
            if (!path) return null;
            return (
              <Path
                key={`touch-${seg.index}`}
                d={path}
                fill="transparent"
                onPress={() => onSegmentPress(seg.index)}
              />
            );
          })}
      </Svg>

      {/* Center content */}
      {children && (
        <View style={[styles.center, {width: size, height: size}]}>
          {children}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  center: {
    position: 'absolute',
    top: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default DonutChart;
