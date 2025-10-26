import React, { useState } from 'react';
import { Image, ImageProps, View, ActivityIndicator } from 'react-native';

interface OptimizedImageProps extends ImageProps {
  source: { uri: string } | number;
  width?: number;
  height?: number;
  aspectRatio?: number;
  showLoader?: boolean;
}

export function OptimizedImage({
  source,
  width,
  height,
  aspectRatio,
  showLoader = true,
  style,
  ...props
}: OptimizedImageProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Generate responsive image size
  const getOptimizedUri = (uri: string, targetWidth?: number) => {
    // If it's already a blob or data URI, return as-is
    if (uri.startsWith('blob:') || uri.startsWith('data:')) {
      return uri;
    }

    // For external URLs, add width parameter if supported
    if (targetWidth && (uri.includes('cloudinary') || uri.includes('imgix'))) {
      const separator = uri.includes('?') ? '&' : '?';
      return `${uri}${separator}w=${Math.round(targetWidth * 2)}`; // 2x for retina
    }

    return uri;
  };

  const imageSource = typeof source === 'number'
    ? source
    : { uri: getOptimizedUri(source.uri, width) };

  const containerStyle: any = [
    width && { width },
    height && { height },
    aspectRatio && { aspectRatio },
  ].filter(Boolean);

  return (
    <View style={containerStyle}>
      <Image
        {...props}
        source={imageSource}
        style={[{ width: '100%', height: '100%' }, style]}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
        fadeDuration={300}
      />
      {loading && showLoader && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.05)',
          }}
        >
          <ActivityIndicator size="small" color="#666" />
        </View>
      )}
      {error && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#f0f0f0',
          }}
        >
          {/* Fallback for error state */}
        </View>
      )}
    </View>
  );
}
