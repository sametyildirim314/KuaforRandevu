import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import HomeScreen from '../screens/main/HomeScreen';
import AppointmentsScreen from '../screens/main/AppointmentsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

const Tab = createBottomTabNavigator();

function TabIcon({ name, focused }) {
  const icons = {
    Home: '🏠',
    Appointments: '📅',
    Profile: '👤',
  };
  return <Text style={{ fontSize: 24 }}>{icons[name] || '•'}</Text>;
}

export default function MainTab() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        headerTitleStyle: { fontWeight: '700', fontSize: 18 },
        tabBarActiveTintColor: '#6C5CE7',
        tabBarInactiveTintColor: '#636E72',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#eee',
          paddingTop: 8,
        },
        tabBarIcon: ({ focused }) => (
          <TabIcon name={route.name} focused={focused} />
        ),
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Ana Sayfa' }}
      />
      <Tab.Screen
        name="Appointments"
        component={AppointmentsScreen}
        options={{ title: 'Randevular' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profil' }}
      />
    </Tab.Navigator>
  );
}
