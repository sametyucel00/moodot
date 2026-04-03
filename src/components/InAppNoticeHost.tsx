import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS } from '@/src/constants/theme';
import { noticeService, type NoticeType } from '@/src/features/notice/noticeService';

const typeColor: Record<NoticeType, string> = {
  success: '#0F9D58',
  error: '#B72A2A',
  info: COLORS.accent,
};

export const InAppNoticeHost = () => {
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState('');
  const [type, setType] = useState<NoticeType>('info');
  const translateY = useRef(new Animated.Value(60)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHideTimeout = () => {
    if (!hideTimeoutRef.current) {
      return;
    }
    clearTimeout(hideTimeoutRef.current);
    hideTimeoutRef.current = null;
  };

  useEffect(() => {
    return noticeService.subscribe((payload) => {
      clearHideTimeout();
      translateY.stopAnimation();
      opacity.stopAnimation();
      setMessage(payload.message);
      setType(payload.type);

      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start(() => {
        hideTimeoutRef.current = setTimeout(() => {
          Animated.parallel([
            Animated.timing(translateY, {
              toValue: 60,
              duration: 220,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 220,
              useNativeDriver: true,
            }),
          ]).start();
        }, 2400);
      });
    });
  }, [opacity, translateY]);

  useEffect(() => {
    return () => clearHideTimeout();
  }, []);

  return (
    <View pointerEvents="none" style={[styles.wrapper, { bottom: 72 + insets.bottom }]}>
      <Animated.View
        style={[
          styles.notice,
          { backgroundColor: typeColor[type], opacity, transform: [{ translateY }] },
        ]}
      >
        <Text style={styles.text}>{message}</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 100,
    alignItems: 'center',
  },
  notice: {
    minWidth: '78%',
    maxWidth: '92%',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    elevation: 6,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
