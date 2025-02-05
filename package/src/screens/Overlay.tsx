import React, {
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
} from 'react';
import { View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  runOnUI,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { TRANSITION_CONFIG } from '../config/animations';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CloseButton from '../components/CloseButton';
import OverlayBackdrop from './OverlayBackdrop';
import { SkImage } from '@shopify/react-native-skia';
import { BORDER_RADIUS_OVERLAY } from '../config/settings';
import { PopoutTileType } from '../types/PopoutTile';
import { PopoutContext } from '../components/PopoutRootView';

interface Props extends React.ComponentProps<typeof Animated.View> {
  item: PopoutTileType;
  hide: () => void;
  image: SkImage;
}
const Overlay = ({ item, hide, image, children }: PropsWithChildren<Props>) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  // TODO: refactor into hook, together with the one in OverlayBackdrop.tsx
  const { overlayUnderNotch } = useContext(PopoutContext);
  const insets = useSafeAreaInsets();
  const screenHeightMinusInset =
    screenHeight - (overlayUnderNotch ? 0 : insets.top);

  // We have all separate values, because we need to perform the animations imperatively due to new data coming in via props
  const overlayProgress = useSharedValue(0);
  const overlayX = useSharedValue(0);
  const overlayY = useSharedValue(0);

  // const aspectRatio = (item.origin?.width || 1) / (item.origin?.height || 1);
  const scale = (item.origin?.width || 0) / screenWidth;
  const overlayScale = useSharedValue(scale);
  const overlayWidth = useSharedValue((item.origin?.width || 0) / scale);
  const overlayHeight = useSharedValue((item.origin?.height || 0) / scale);

  const shadowImageOpacity = useSharedValue(1);

  const panX = useSharedValue(0);
  const panY = useSharedValue(0);
  const panScale = useSharedValue(1);
  const panStartX = useSharedValue(0);
  const panStartY = useSharedValue(0);

  const resetOverlay = () => {
    'worklet';
    overlayProgress.value = withTiming(0, TRANSITION_CONFIG, () => {
      runOnJS(hide)(); // todo; earlier
    });
    overlayX.value = withTiming(0, TRANSITION_CONFIG);
    overlayY.value = withTiming(0, TRANSITION_CONFIG);
    overlayScale.value = withTiming(
      (item.origin?.width || 0) / screenWidth,
      TRANSITION_CONFIG
    );
    shadowImageOpacity.value = withTiming(1, TRANSITION_CONFIG);
    overlayWidth.value = withTiming(
      (item.origin?.width || 0) / scale,
      TRANSITION_CONFIG
    );
    overlayHeight.value = withTiming(
      (item.origin?.height || 0) / scale,
      TRANSITION_CONFIG
    );
  };
  const resetPan = () => {
    'worklet';
    panX.value = withTiming(0, TRANSITION_CONFIG);
    panY.value = withTiming(0, TRANSITION_CONFIG);
    panScale.value = withTiming(1, TRANSITION_CONFIG);
  };
  const onOpen = () => {
    'worklet';
    // Entering animation
    overlayProgress.value = withTiming(1, TRANSITION_CONFIG);
    overlayX.value = withTiming(-(item?.origin?.x || 0), TRANSITION_CONFIG);
    overlayY.value = withTiming(
      -(item.origin?.y || 0) + (overlayUnderNotch ? 0 : insets.top),
      TRANSITION_CONFIG
    );
    overlayWidth.value = withTiming(screenWidth, TRANSITION_CONFIG);
    overlayHeight.value = withTiming(screenHeightMinusInset, TRANSITION_CONFIG);
    overlayScale.value = withTiming(1, TRANSITION_CONFIG);
    shadowImageOpacity.value = withTiming(0, TRANSITION_CONFIG);
  };
  const onClose = () => {
    'worklet';
    // Closing animation
    resetOverlay();
    resetPan();
  };

  useEffect(() => {
    runOnUI(onOpen)();
  }, [onOpen]);

  const overlayAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: overlayX.value + panX.value },
        { translateY: overlayY.value + panY.value },
        { scale: overlayScale.value + panScale.value - 1 },
      ],
      width: overlayWidth.value,
      height: overlayHeight.value,
      borderRadius: interpolate(
        overlayProgress.value,
        [0, 1],
        [BORDER_RADIUS_OVERLAY * (1 / scale), BORDER_RADIUS_OVERLAY]
      ),
      opacity: interpolate(overlayProgress.value, [0, 0.05, 1], [0, 0.7, 1]),
    };
  }, [item]);

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .onChange((event) => {
          panX.value = event.translationX;
          panY.value = event.translationY;
          panScale.value = interpolate(
            event.translationY,
            [0, 500],
            [1, 0.75],
            Extrapolation.CLAMP
          );
        })
        .onEnd((event) => {
          event.translationY > 200 ? onClose() : resetPan();
        }),
    [
      onClose,
      insets.top,
      item,
      panStartX,
      panStartY,
      panX,
      panY,
      panScale,
      resetPan,
    ]
  );

  /* const colors = useImageColors(item.image);

  const textColor = useMemo(() => {
    const backgroundColor =
      colors?.platform === 'android'
        ? colors?.dominant
        : colors?.platform === 'ios'
        ? colors?.background
        : 'white';
    return getReadableTextColorByBackground(backgroundColor);
  }, [colors]); */

  return (
    <Animated.View
      style={[
        {
          zIndex: 100,
          width: screenWidth,
          overflow: 'hidden',
          // @ts-ignore works!
          transformOrigin: 'top left',
        },
        overlayAnimatedStyle,
      ]}
    >
      <GestureDetector gesture={panGesture}>
        <View>
          <OverlayBackdrop image={image} blurred opacity={1} />
          <View
            style={{
              paddingTop: overlayUnderNotch ? insets.top : 0,
            }}
          >
            {children}
          </View>
          <CloseButton hide={onClose} />
          {/* TODO: make the image centered so that it animates from- and back into the tile in 'cover' mode style */}
          <OverlayBackdrop image={image} opacity={shadowImageOpacity} />
        </View>
      </GestureDetector>
    </Animated.View>
  );
};

export default Overlay;
