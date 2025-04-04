import { Dimensions } from "react-native";
export const deviceWidth = Dimensions.get("window").width;
export const deviceHeight = Dimensions.get("window").height;

const baseWidth = 375;
const baseHeight = 810;

const scaleWidth = deviceWidth / baseWidth;
const scaleHeight = deviceHeight / baseHeight;
const scale = Math.min(scaleWidth, scaleHeight);

export const resize: any = (size: any) => Math.ceil(size * scale) as any;
