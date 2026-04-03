import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import type { MoodDefinition, MoodId } from '@/src/types';

type Props = {
  moods: MoodDefinition[];
  selectedMoodId?: MoodId;
  colorByMoodId: Record<string, string>;
  onSelect: (moodId: MoodId) => void;
};

export const ColorPicker = ({ moods, selectedMoodId, colorByMoodId, onSelect }: Props) => {
  const scales = useRef<Record<string, Animated.Value>>({}).current;

  useEffect(() => {
    moods.forEach((mood) => {
      if (!scales[mood.id]) {
        scales[mood.id] = new Animated.Value(1);
      }

      Animated.spring(scales[mood.id], {
        toValue: selectedMoodId === mood.id ? 1.1 : 1,
        damping: 15,
        stiffness: 220,
        mass: 0.7,
        useNativeDriver: true,
      }).start();
    });
  }, [moods, scales, selectedMoodId]);

  const selectedLabel = useMemo(
    () => moods.find((mood) => mood.id === selectedMoodId)?.label,
    [moods, selectedMoodId],
  );

  return (
    <View style={styles.wrap}>
      <View style={styles.grid}>
        {moods.map((mood) => {
          const selected = mood.id === selectedMoodId;
          return (
            <Pressable key={mood.id} onPress={() => onSelect(mood.id)} style={styles.item}>
              <Animated.View
                style={[
                  styles.color,
                  {
                    backgroundColor: colorByMoodId[mood.id] ?? mood.defaultHex,
                    transform: [{ scale: scales[mood.id] ?? 1 }],
                  },
                  selected && styles.colorSelected,
                ]}
              />
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.selectedLabel}>{selectedLabel ?? 'Pick your color'}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    gap: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 18,
    paddingHorizontal: 8,
  },
  item: {
    width: '31.5%',
    alignItems: 'center',
  },
  color: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  colorSelected: {
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  selectedLabel: {
    textAlign: 'center',
    fontSize: 15,
    color: '#2A2A2A',
    fontWeight: '600',
    minHeight: 20,
  },
<<<<<<< HEAD
});
=======
});
>>>>>>> 7493727 (Initial Moodot app setup)
