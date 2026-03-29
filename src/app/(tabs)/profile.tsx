import React from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Sharing from 'expo-sharing';
import ViewShot from 'react-native-view-shot';

import { ConfirmationSheet } from '@/src/components/ConfirmationSheet';
import { MonthlyMosaic } from '@/src/components/MonthlyMosaic';
import { YearlyMosaic } from '@/src/components/YearlyMosaic';
import { COLORS } from '@/src/constants/theme';
import { adService } from '@/src/features/ads/adService';
import { useAppContext } from '@/src/features/app/AppContext';
import { exportService } from '@/src/features/export/exportService';
import { fromHourMinuteToTime, fromTimeToHourMinute, getTodayKey } from '@/src/features/mood/dateUtils';
import { noticeService } from '@/src/features/notice/noticeService';
import { paletteService } from '@/src/features/palette/paletteService';

const shiftReminder = (time: string, deltaMinutes: number): string => {
  const { hour, minute } = fromTimeToHourMinute(time);
  const base = hour * 60 + minute + deltaMinutes;
  const wrapped = ((base % 1440) + 1440) % 1440;
  return fromHourMinuteToTime(Math.floor(wrapped / 60), wrapped % 60);
};

const Row = ({ label, right }: { label: string; right: React.ReactNode }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    {right}
  </View>
);

const Section = ({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {description ? <Text style={styles.sectionDescription}>{description}</Text> : null}
    {children}
  </View>
);

export default function ProfileScreen() {
  const {
    settings,
    updateSettings,
    runSync,
    syncState,
    purchasePremium,
    authState,
    connectCloudAccount,
    disconnectCloudAccount,
    deletePremiumCloudAccount,
    entries,
  } = useAppContext();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const availablePalettes = paletteService.getAllPalettes();
  const [unlockingPaletteId, setUnlockingPaletteId] = React.useState<string | null>(null);
  const [unlockingExportCards, setUnlockingExportCards] = React.useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = React.useState(false);
  const [deletingAccount, setDeletingAccount] = React.useState(false);
  const todayKey = getTodayKey();
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  const monthlyRef = React.useRef<ViewShot>(null);
  const yearlyRef = React.useRef<ViewShot>(null);
  const hasPremiumExportCardsAccess = settings.isPremium || settings.adPremiumCardsUnlockDate === todayKey;
  const canShareCards = hasPremiumExportCardsAccess;
  const entriesByDate = React.useMemo(
    () =>
      entries.reduce<Record<string, (typeof entries)[number]>>((acc, entry) => {
        acc[entry.date] = entry;
        return acc;
      }, {}),
    [entries],
  );

  const providerLabel =
    authState.provider === 'apple' ? 'Apple' : authState.provider === 'google' ? 'Google' : 'Account';

  const unlockPremiumExportCards = async () => {
    if (settings.isPremium || hasPremiumExportCardsAccess || unlockingExportCards) {
      return;
    }

    setUnlockingExportCards(true);
    try {
      const unlocked = await adService.showRewardedAd();
      if (!unlocked) {
        noticeService.show('Reward not completed.', 'info');
        return;
      }
      await updateSettings({ adPremiumCardsUnlockDate: todayKey });
      noticeService.show('Premium export cards unlocked for today.', 'success');
    } catch {
      noticeService.show('Could not unlock export cards right now.', 'error');
    } finally {
      setUnlockingExportCards(false);
    }
  };

  const exportMonthly = async (quality: 'standard' | 'hd') => {
    if (!monthlyRef.current) {
      noticeService.show('Monthly export is not ready yet.', 'error');
      return;
    }

    try {
      const uri = await exportService.exportMosaicFromView({
        viewRef: monthlyRef,
        quality,
        isPremium: settings.isPremium,
        unlockHdWithAd: () => adService.showRewardedForHdExport(),
      });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          dialogTitle: quality === 'hd' ? 'Export Monthly HD' : 'Export Monthly',
        });
      }
      noticeService.show(quality === 'hd' ? 'Monthly HD export ready.' : 'Monthly export ready.', 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Monthly export failed.';
      noticeService.show(message, 'error');
    }
  };

  const shareMonthly = async () => {
    if (!monthlyRef.current || !(await Sharing.isAvailableAsync())) {
      noticeService.show('Sharing is not available on this device.', 'error');
      return;
    }
    if (!canShareCards) {
      noticeService.show('Unlock premium share cards for today first.', 'info');
      return;
    }

    try {
      const uri = await exportService.exportMosaicFromView({
        viewRef: monthlyRef,
        quality: 'hd',
        isPremium: settings.isPremium,
        unlockHdWithAd: () => adService.showRewardedForHdExport(),
      });
      await Sharing.shareAsync(uri, { dialogTitle: 'Share your month in colors' });
    } catch {
      noticeService.show('Monthly share failed.', 'error');
    }
  };

  const exportYearly = async (quality: 'standard' | 'hd') => {
    if (!yearlyRef.current) {
      noticeService.show('Yearly export is not ready yet.', 'error');
      return;
    }
    if (!hasPremiumExportCardsAccess) {
      noticeService.show('Unlock premium export cards for today first.', 'info');
      return;
    }

    try {
      const uri = await exportService.exportMosaicFromView({
        viewRef: yearlyRef,
        quality,
        isPremium: settings.isPremium,
        unlockHdWithAd: () => adService.showRewardedForHdExport(),
      });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          dialogTitle: quality === 'hd' ? 'Export Yearly HD' : 'Export Yearly',
        });
      }
      noticeService.show(quality === 'hd' ? 'Yearly HD export ready.' : 'Yearly export ready.', 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Yearly export failed.';
      noticeService.show(message, 'error');
    }
  };

  const shareYearly = async () => {
    if (!yearlyRef.current || !(await Sharing.isAvailableAsync())) {
      noticeService.show('Sharing is not available on this device.', 'error');
      return;
    }
    if (!hasPremiumExportCardsAccess) {
      noticeService.show('Unlock premium export cards for today first.', 'info');
      return;
    }

    try {
      const uri = await exportService.exportMosaicFromView({
        viewRef: yearlyRef,
        quality: 'hd',
        isPremium: settings.isPremium,
        unlockHdWithAd: () => adService.showRewardedForHdExport(),
      });
      await Sharing.shareAsync(uri, { dialogTitle: 'Share your year in colors' });
    } catch {
      noticeService.show('Yearly share failed.', 'error');
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        {
          paddingHorizontal: width < 370 ? 14 : 18,
          paddingTop: Math.max(12, insets.top + 4),
          paddingBottom: Math.max(28, insets.bottom + 20),
        },
      ]}
    >
      <View style={styles.listCard}>
        <Section title="Preferences" description="Keep your daily journaling simple and familiar.">
          <Row
            label="Notifications"
            right={
              <Switch
                value={settings.notificationsEnabled}
                onValueChange={(value) => updateSettings({ notificationsEnabled: value })}
              />
            }
          />

          <Row
            label={`Reminder: ${settings.reminderTime}`}
            right={
              <View style={styles.timeActions}>
                <Pressable
                  style={styles.smallButton}
                  onPress={() => updateSettings({ reminderTime: shiftReminder(settings.reminderTime, -30) })}
                >
                  <Text style={styles.smallButtonText}>-30m</Text>
                </Pressable>
                <Pressable
                  style={styles.smallButton}
                  onPress={() => updateSettings({ reminderTime: shiftReminder(settings.reminderTime, 30) })}
                >
                  <Text style={styles.smallButtonText}>+30m</Text>
                </Pressable>
              </View>
            }
          />

          <View style={styles.paletteBlock}>
            <Text style={styles.rowLabel}>Palette</Text>
          <View style={styles.paletteRows}>
            {availablePalettes.map((palette) => {
              const unlockedForToday = settings.adPaletteUnlockDate === todayKey;
              const locked = palette.isPremium && !settings.isPremium && !unlockedForToday;
              const selected = settings.selectedPaletteId === palette.id;
              return (
                <Pressable
                  key={palette.id}
                  style={[styles.paletteRow, selected && styles.paletteRowSelected]}
                  onPress={async () => {
                    if (locked) {
                      if (unlockingPaletteId) {
                        return;
                      }
                      setUnlockingPaletteId(palette.id);
                      try {
                        const unlocked = await adService.showRewardedAd();
                        if (!unlocked) {
                          noticeService.show('Reward not completed.', 'info');
                          return;
                        }
                        await updateSettings({
                          adPaletteUnlockDate: todayKey,
                          selectedPaletteId: palette.id,
                        });
                        noticeService.show('Palette unlocked for today.', 'success');
                      } catch {
                        noticeService.show('Could not unlock palette right now.', 'error');
                      } finally {
                        setUnlockingPaletteId(null);
                      }
                      return;
                    }
                    updateSettings({ selectedPaletteId: palette.id });
                  }}
                >
                  <Text style={styles.paletteName}>{palette.name}</Text>
                  <Text style={styles.paletteMeta}>
                    {locked
                      ? unlockingPaletteId === palette.id
                        ? 'Unlocking...'
                        : 'Watch ad (1 day)'
                      : palette.isPremium && !settings.isPremium
                        ? 'Unlocked today'
                        : 'Available'}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          </View>

          <Row
            label="Premium status"
            right={
              settings.isPremium ? (
                <Text style={styles.statusText}>Active</Text>
              ) : (
                <Pressable
                  style={styles.smallButton}
                  onPress={async () => {
                    const ok = await purchasePremium();
                    noticeService.show(ok ? 'Premium unlocked.' : 'Purchase not completed.', ok ? 'success' : 'error');
                  }}
                >
                  <Text style={styles.smallButtonText}>Unlock</Text>
                </Pressable>
              )
            }
          />
        </Section>

        <Section title="Cloud Backup & Sync" description="Back up your colors and restore them across devices.">
          {!settings.isPremium ? (
            <>
              <Text style={styles.syncMessage}>Cloud backup is available with Premium.</Text>
              <Pressable
                style={styles.smallButton}
                onPress={async () => {
                  const ok = await purchasePremium();
                  noticeService.show(ok ? 'Premium unlocked.' : 'Purchase not completed.', ok ? 'success' : 'error');
                }}
              >
                <Text style={styles.smallButtonText}>Upgrade</Text>
              </Pressable>
            </>
          ) : !authState.isSignedIn ? (
            <>
              <Text style={styles.syncMessage}>Connect your account to sync across devices.</Text>
              <Text style={styles.syncSubtext}>Back up your colors and restore them across devices.</Text>
              <Pressable
                style={styles.smallButton}
                disabled={authState.loading}
                onPress={async () => {
                  try {
                    await connectCloudAccount();
                    noticeService.show('Cloud sync connected.', 'success');
                  } catch (error) {
                    const message = error instanceof Error ? error.message : 'Sign in failed.';
                    noticeService.show(message, 'error');
                  }
                }}
              >
                <Text style={styles.smallButtonText}>{authState.loading ? 'Please wait' : 'Connect account'}</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={styles.syncMessage}>Connected with {providerLabel}</Text>
              <Text style={styles.syncSubtext}>Status: {syncState.inProgress ? 'Syncing...' : 'Ready'}</Text>
              <Text style={styles.syncSubtext}>
                Last sync: {settings.cloudLastSyncedAt ? new Date(settings.cloudLastSyncedAt).toLocaleString() : 'Never'}
              </Text>
              {syncState.error ? <Text style={styles.syncError}>Sync error: {syncState.error}</Text> : null}
              <View style={styles.syncActions}>
                <Pressable
                  style={styles.smallButton}
                  disabled={syncState.inProgress}
                  onPress={async () => {
                    try {
                      await runSync();
                      noticeService.show('Synced successfully.', 'success');
                    } catch (error) {
                      const message = error instanceof Error ? error.message : 'Sync failed.';
                      noticeService.show(message, 'error');
                    }
                  }}
                >
                  <Text style={styles.smallButtonText}>{syncState.inProgress ? 'Syncing' : 'Sync now'}</Text>
                </Pressable>

                <Pressable
                  style={styles.smallButton}
                  onPress={async () => {
                    try {
                      await disconnectCloudAccount();
                      noticeService.show('Cloud account disconnected.', 'info');
                    } catch (error) {
                      const message = error instanceof Error ? error.message : 'Sign out failed.';
                      noticeService.show(message, 'error');
                    }
                  }}
                >
                  <Text style={styles.smallButtonText}>Sign out</Text>
                </Pressable>
                <Pressable
                  style={[styles.smallButton, styles.dangerButton]}
                  onPress={() => setDeleteModalVisible(true)}
                >
                  <Text style={[styles.smallButtonText, styles.dangerText]}>Delete account</Text>
                </Pressable>
              </View>
            </>
          )}
        </Section>

        <Section title="Export" description="Create and share polished monthly and yearly snapshots.">
          {!hasPremiumExportCardsAccess ? (
            <Pressable style={styles.smallButton} disabled={unlockingExportCards} onPress={unlockPremiumExportCards}>
              <Text style={styles.smallButtonText}>
                {unlockingExportCards ? 'Unlocking...' : 'Watch Ad Unlock Share + Yearly (1 day)'}
              </Text>
            </Pressable>
          ) : null}

          <Text style={styles.exportTitle}>This Month</Text>
          <View style={styles.exportActions}>
            <Pressable style={styles.smallButton} onPress={() => exportMonthly('standard')}>
              <Text style={styles.smallButtonText}>Export</Text>
            </Pressable>
            <Pressable style={styles.smallButton} onPress={() => exportMonthly('hd')}>
              <Text style={styles.smallButtonText}>HD Export</Text>
            </Pressable>
            <Pressable
              style={[styles.smallButton, !canShareCards && styles.disabledButton]}
              onPress={shareMonthly}
              disabled={!canShareCards}
            >
              <Text style={styles.smallButtonText}>Share</Text>
            </Pressable>
          </View>

          <Text style={styles.exportTitle}>This Year</Text>
          <View style={styles.exportActions}>
            <Pressable
              style={[styles.smallButton, !hasPremiumExportCardsAccess && styles.disabledButton]}
              onPress={() => exportYearly('standard')}
              disabled={!hasPremiumExportCardsAccess}
            >
              <Text style={styles.smallButtonText}>Export</Text>
            </Pressable>
            <Pressable
              style={[styles.smallButton, !hasPremiumExportCardsAccess && styles.disabledButton]}
              onPress={() => exportYearly('hd')}
              disabled={!hasPremiumExportCardsAccess}
            >
              <Text style={styles.smallButtonText}>HD Export</Text>
            </Pressable>
            <Pressable
              style={[styles.smallButton, !hasPremiumExportCardsAccess && styles.disabledButton]}
              onPress={shareYearly}
              disabled={!hasPremiumExportCardsAccess}
            >
              <Text style={styles.smallButtonText}>Share</Text>
            </Pressable>
          </View>
        </Section>

        <View style={styles.previewStack}>
          <ViewShot ref={monthlyRef} style={styles.exportCanvas}>
            <View collapsable={false}>
              <Text style={styles.exportCanvasTitle}>
                This Month - {now.toLocaleString('en-US', { month: 'long' })} {year}
              </Text>
              <MonthlyMosaic year={year} month={month} entriesByDate={entriesByDate} />
            </View>
          </ViewShot>
          <ViewShot ref={yearlyRef} style={styles.exportCanvas}>
            <View collapsable={false}>
              <Text style={styles.exportCanvasTitle}>This Year - {year}</Text>
              <YearlyMosaic year={year} entriesByDate={entriesByDate} />
            </View>
          </ViewShot>
        </View>
      </View>
      <ConfirmationSheet
        visible={deleteModalVisible}
        title="Delete cloud account?"
        description="This permanently removes the connected account and synced cloud data. Your local device data stays on this phone unless you delete it separately."
        confirmLabel="Delete"
        tone="danger"
        busy={deletingAccount}
        onCancel={() => {
          if (!deletingAccount) {
            setDeleteModalVisible(false);
          }
        }}
        onConfirm={async () => {
          try {
            setDeletingAccount(true);
            await deletePremiumCloudAccount();
            setDeleteModalVisible(false);
            noticeService.show('Cloud account deleted.', 'success');
          } catch (error) {
            const message =
              error instanceof Error ? error.message : 'Account deletion failed. Try signing in again first.';
            noticeService.show(message, 'error');
          } finally {
            setDeletingAccount(false);
          }
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FCFCFA',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 16,
  },
  listCard: {
    gap: 14,
  },
  section: {
    borderWidth: 1,
    borderColor: '#EAEAEA',
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    padding: 14,
    gap: 10,
  },
  sectionTitle: {
    color: '#171717',
    fontSize: 15,
    fontWeight: '700',
  },
  sectionDescription: {
    color: '#747474',
    fontSize: 12,
    lineHeight: 17,
  },
  row: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  rowLabel: {
    color: '#202020',
    fontSize: 14,
    fontWeight: '500',
  },
  rowMeta: {
    color: '#767676',
    fontSize: 13,
  },
  timeActions: {
    flexDirection: 'row',
    gap: 8,
  },
  smallButton: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: '#FFFFFF',
  },
  smallButtonText: {
    color: '#303030',
    fontSize: 12,
    fontWeight: '600',
  },
  paletteBlock: {
    borderWidth: 1,
    borderColor: '#EFEFEF',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  paletteRows: {
    gap: 8,
  },
  paletteRow: {
    borderWidth: 1,
    borderColor: '#EAEAEA',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paletteRowSelected: {
    borderColor: '#2E2E2E',
    borderWidth: 2,
  },
  paletteName: {
    color: '#202020',
    fontSize: 13,
    fontWeight: '600',
  },
  paletteMeta: {
    color: '#8A8A8A',
    fontSize: 12,
  },
  statusText: {
    color: '#0F9D58',
    fontSize: 13,
    fontWeight: '700',
  },
  syncBlock: {
    borderWidth: 1,
    borderColor: '#EFEFEF',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  syncTitle: {
    color: '#202020',
    fontSize: 14,
    fontWeight: '600',
  },
  syncMessage: {
    color: '#2C2C2C',
    fontSize: 13,
  },
  syncSubtext: {
    color: '#6D6D6D',
    fontSize: 12,
  },
  syncError: {
    color: '#BB2A2A',
    fontSize: 12,
  },
  syncActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  exportTitle: {
    color: '#232323',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  exportActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  dangerButton: {
    borderColor: '#E8B9B9',
    backgroundColor: '#FFF6F6',
  },
  dangerText: {
    color: '#9E2E2E',
  },
  previewStack: {
    gap: 10,
  },
  exportCanvas: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    padding: 24,
    gap: 14,
  },
  exportCanvasTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1D1D1D',
  },
});
