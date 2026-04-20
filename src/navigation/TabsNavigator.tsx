import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Pressable, StyleSheet, Text } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { HomeScreen } from '../screens/HomeScreen';
import { WeighScreen } from '../screens/WeighScreen';
import { LotsScreen } from '../screens/LotsScreen';
import { ReportsScreen } from '../screens/ReportsScreen';
import { colors, spacing } from '../theme';
import type { RootStackParamList, TabsParamList } from './types';

const Tabs = createBottomTabNavigator<TabsParamList>();

function tabIcon(emoji: string) {
  return ({ focused }: { focused: boolean }) => (
    <Text style={{ fontSize: focused ? 26 : 22 }}>{emoji}</Text>
  );
}

function SettingsButton() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <Pressable
      onPress={() => navigation.navigate('Settings')}
      hitSlop={12}
      style={styles.settingsBtn}
      accessibilityLabel="Abrir configurações"
    >
      <Text style={styles.settingsIcon}>⚙️</Text>
    </Pressable>
  );
}

export function TabsNavigator() {
  return (
    <Tabs.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.textInverse,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Tabs.Screen
        name="Início"
        component={HomeScreen}
        options={{
          tabBarIcon: tabIcon('🏠'),
          headerRight: () => <SettingsButton />,
        }}
      />
      <Tabs.Screen
        name="Pesar"
        component={WeighScreen}
        options={{ tabBarIcon: tabIcon('⚖️') }}
      />
      <Tabs.Screen
        name="Lotes"
        component={LotsScreen}
        options={{ tabBarIcon: tabIcon('🗂️') }}
      />
      <Tabs.Screen
        name="Relatórios"
        component={ReportsScreen}
        options={{ tabBarIcon: tabIcon('📊') }}
      />
    </Tabs.Navigator>
  );
}

const styles = StyleSheet.create({
  settingsBtn: {
    paddingHorizontal: spacing.md,
  },
  settingsIcon: {
    fontSize: 22,
  },
});
