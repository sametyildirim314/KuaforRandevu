import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import DashboardScreen from '../screens/salon/DashboardScreen';
import SalonAppointmentsScreen from '../screens/salon/SalonAppointmentsScreen';
import BarbersManageScreen from '../screens/salon/BarbersManageScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import NotificationsScreen from '../screens/main/NotificationsScreen';
import useNotificationStore from '../store/notificationStore';
import { COLORS } from '../utils/theme';

const Tab = createBottomTabNavigator();

function TabIcon({ name }) {
  const icons = {
    Dashboard: '📊',
    SalonAppointments: '📋',
    Notifications: '🔔',
    BarbersManage: '✂️',
    SalonProfile: '👤',
  };
  return <Text style={{ fontSize: 22 }}>{icons[name] || '•'}</Text>;
}



export default function SalonTab() {
  const unreadCount = useNotificationStore((state) => state.unreadCount);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        headerTitleStyle: { fontWeight: '700', fontSize: 18, color: COLORS.textPrimary },
        tabBarActiveTintColor: COLORS.tabActive,
        tabBarInactiveTintColor: COLORS.tabInactive,
        tabBarStyle: {
          backgroundColor: COLORS.tabBar,
          borderTopColor: COLORS.border,
          paddingTop: 8,
        },
        tabBarIcon: () => <TabIcon name={route.name} />,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Panel' }} />
      <Tab.Screen name="SalonAppointments" component={SalonAppointmentsScreen} options={{ title: 'Randevular' }} />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          title: 'Bildirimler',
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
        }}
      />
      <Tab.Screen name="BarbersManage" component={BarbersManageScreen} options={{ title: 'Berberler' }} />
      <Tab.Screen name="SalonProfile" component={ProfileScreen} options={{ title: 'Profil' }} />
    </Tab.Navigator>
  );
}
