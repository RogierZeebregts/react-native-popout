import React from 'react';
import {Dimensions, View} from 'react-native';
import Animated, {
  Easing,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {SPRING_CONFIG} from '../config/animations';
import {TileInfo} from '../../screens/Overview';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Overlay from '../../screens/Overlay';

const {height, width} = Dimensions.get('window');

const TileAnimation = ({item, hide}: {item: TileInfo; hide: () => void}) => {
  const insets = useSafeAreaInsets();

  const CustomEnteringAnimation: EntryOrExitLayoutType = values => {
    'worklet';
    const animations = {
      width: withSpring(width, SPRING_CONFIG),
      height: withSpring(height - insets.top, SPRING_CONFIG),
      transform: [
        {translateX: withSpring(-(item.origin?.x || 0), SPRING_CONFIG)},
        {
          translateY: withSpring(
            insets.top - (item.origin?.y || 0),
            SPRING_CONFIG,
          ),
        },
      ],
      borderRadius: withSpring(16, SPRING_CONFIG),
      opacity: withTiming(1, {duration: 200}),
    };
    const initialValues = {
      // initial values for animations
      width: item.origin?.width,
      height: item.origin?.height,
      transform: [{translateX: 0}, {translateY: 0}],
      borderRadius: 4,
      opacity: 0,
    };
    const callback = (finished: boolean) => {
      // optional callback that will fire when layout animation ends
    };
    return {
      initialValues,
      animations,
      callback,
    };
  };

  const exitingX = useSharedValue(0);
  const exitingY = useSharedValue(0);
  const exitingScale = useSharedValue(1);

  const CustomExitingAnimation: EntryOrExitLayoutType = values => {
    'worklet';
    const animations = {
      width: withSpring(item.origin?.width || 0, SPRING_CONFIG),
      height: withSpring(item.origin?.height || 0, SPRING_CONFIG),
      transform: [
        {translateX: withSpring(0, SPRING_CONFIG)},
        {translateY: withSpring(0, SPRING_CONFIG)},
      ],
      borderRadius: withSpring(4, SPRING_CONFIG),
      opacity: withTiming(0, {duration: 700, easing: Easing.quad}),
    };
    const initialValues = {
      // initial values for animations
      width: exitingScale.value * width,
      height: exitingScale.value * (height - insets.top),
      transform: [
        {translateX: -(item.origin?.x || 0) + exitingX.value},
        {
          translateY: insets.top - (item.origin?.y || 0) + exitingY.value,
        },
      ],
      borderRadius: 16,
      opacity: 1,
    };
    const callback = (finished: boolean) => {
      // optional callback that will fire when layout animation ends
      // finished && runOnJS(hide)();
    };
    return {
      initialValues,
      animations,
      callback,
    };
  };

  if (!item) {
    return null;
  }

  return (
    <View
      style={{
        left: item?.origin?.x,
        top: item?.origin?.y,
        width: item?.origin?.width,
        height: item?.origin?.height,
      }}>
      <Overlay
        item={item}
        hide={({dragX, dragY, scale}) => {
          exitingX.value = dragX;
          exitingY.value = dragY;
          exitingScale.value = scale;
          hide();
        }}
        entering={CustomEnteringAnimation}
        exiting={CustomExitingAnimation}
      />
    </View>
  );
};

export default TileAnimation;
