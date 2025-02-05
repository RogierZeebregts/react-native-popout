# react-native-popout example

Example app for the library.
Three examples are available;

- Netflix: a basic remake of the Netflix app transitions
- AppStore: a basic remake of the iOS App store transitions
- Minimal: a minimal example, just what you need to get started using this library
- Testing: various different shapes and overlays
- Springboard: a basic remake of the iOS Springboard transitions (TODO)

You can swap between the examples by changing the `App.tsx` file.

## Getting Started

### Android

Run to start the example;

```bash
yarn android
```

### iOS

Make sure you added the following to your info.plist file `dict`, in order to support 120hz ProMotion iPhone performance:

```xml
<key>CADisableMinimumFrameDurationOnPhone</key>
<true/>
```

Run to start the example;

```bash
yarn ios
```

## Steps to take to convert to a library

1. Complete the transition so that it works smoothly on both iOS and Android.
2. Tweak the easing of the transition to make it feel more natural.
3. Make a generic `PopoutTile` component that can be used to render the tile.
4. Add a way to pass in a custom component to `PopoutTile` to be rendered in the tile.
5. Add a way to pass in a custom component to `PopoutTile` to be rendered in the popout.
6. Make a `PopoutRootView` component to wrap around your entire application. This facilitates the transition to an absolute overlay. Provide it variables to control the transition (border radius, behind popout blurring, popout blurred image background true/false, ...).
7. Calculate aspect ratio based on width and height of the tile. Currently only width is used, so only tiles larger in height than width are working properly.
8. Image preloading or another solution to prevent the image from flashing in the popout.
9. turn the repo into a library.
   1. start from a [library template](https://reactnative.dev/docs/native-modules-setup)
   2. add reanimated and skia as `peerDependencies`
   3. move the original example into an example folder
10. Publish the library to npm.

## Troubleshooting

TODO
