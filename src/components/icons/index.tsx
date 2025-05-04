import React from 'react';
import Svg, {Rect, Circle, Path} from 'react-native-svg';
import {IconProps} from '../../types/iconProps';

const WalletIcon = (props: IconProps) => {
  return (
    <Svg
      width={props.width || 96}
      height={props.height || 96}
      viewBox="0 0 128 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}>
      <Rect x={8} y={24} width={112} height={64} rx={12} fill="#36F" />
      <Rect
        x={16}
        y={40}
        width={48}
        height={8}
        rx={4}
        fill="#fff"
        opacity={0.85}
      />
      <Circle cx={96} cy={56} r={8} fill="#fff" />
    </Svg>
  );
};

const CheckIcon = (props: IconProps) => {
  return (
    <Svg
      width={props.width || 96}
      height={props.height || 96}
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}>
      <Circle cx={48} cy={48} r={48} fill="#36F" />
      <Path
        d="M28 48l14 14 28-28"
        stroke="#fff"
        strokeWidth={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
const ChartIcon = (props: IconProps) => {
  return (
    <Svg
      width={props.width || 128}
      height={props.height || 96}
      viewBox="0 0 128 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}>
      <Path
        d="M24 64l24-24 24 16 32-32"
        stroke="#36F"
        strokeWidth={12}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M104 24v24M24 64h80"
        stroke="#36F"
        strokeWidth={12}
        strokeLinecap="round"
      />
    </Svg>
  );
};

const Icons = {
  WalletIcon,
  CheckIcon,
  ChartIcon,
};

type IconType = typeof Icons;
export type IconsKeys = keyof IconType;
export default Icons;
