import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Platform } from "react-native";

import index from "./app/index";
import { AuthProvider } from './contexts/AuthContext';
import AdminBoardingsScreen from "./screens/AdminBoardingsScreen";
import AdminLandingScreen from "./screens/AdminLandingScreen";
import AdminUsersScreen from "./screens/AdminUsersScreen";
import BoardingDetailsAdding from "./screens/BoardingDetailsAdding";
import ChatScreen from "./screens/ChatScreen";
import Dashboard from "./screens/Dashboard";
import EditOrUpdateBoarding from "./screens/EditOrUpdateBoarding";
import HomePage from "./screens/HomePage";
import OwnerLoginPage from "./screens/OwnerLoginPage";
import RegistrationPage from "./screens/RegistrationPage";
import ReviewPage from "./screens/ReviewPage";
import UserDashboard from "./screens/UserDashboard";
import UserLoginPage from "./screens/UserLoginPage";

const Stack = createNativeStackNavigator();

// 1. Define the URL path mapping here
const linking = {
  config: {
    screens: {
      index: '',
      HomePage: 'home',
      UserLoginPage: 'login/user',
      OwnerLoginPage: 'login/owner',
      RegistrationPage: 'register',
      UserDashboard: 'userdashboard',
      BoardingDetailsAdding: 'add-boarding',
      Dashboard: 'dashboard',
      ChatScreen: 'chat',
      ReviewPage: 'review',
      EditOrUpdateBoarding: 'edit-boarding',
      AdminLanding: 'admin',
      AdminBoardings: 'admin/boardings',
      AdminUsers: 'admin/users',
    },
  },
};

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer linking={Platform.OS === 'web' ? undefined : linking}>
        <Stack.Navigator initialRouteName="index">
          <Stack.Screen name="index" component={index} options={{ headerShown: false }} />
          <Stack.Screen name="HomePage" component={HomePage} options={{title:"HomePage",headerShown: false}}/>
          <Stack.Screen name="UserLoginPage" component={UserLoginPage} options={{ title: "LoginUser",headerShown: false }} />
          <Stack.Screen name="OwnerLoginPage" component={OwnerLoginPage} options={{ title: "LoginOwner" ,headerShown: false}} />
          <Stack.Screen name="RegistrationPage" component={RegistrationPage} options={{ title: "Registration" ,headerShown: false}} />
          <Stack.Screen name="UserDashboard" component={UserDashboard} options={{ title: "UserDashboard" ,headerShown: false}} />
          <Stack.Screen name="BoardingDetailsAdding" component={BoardingDetailsAdding} options={{ title: "BoardingDetailsAdding" ,headerShown: false}} />
          <Stack.Screen name="Dashboard" component={Dashboard} options={{ title: "Dashboard",headerShown: false }} />
          <Stack.Screen name="ChatScreen" component={ChatScreen} options={{ title: "ChatScreen" ,headerShown: false}} />
          <Stack.Screen name="ReviewPage" component={ReviewPage} options={{ title: "ReviewPage" ,headerShown: false}} />
          <Stack.Screen name="EditOrUpdateBoarding" component={EditOrUpdateBoarding} options={{ title: "EditOrUpdateBoarding" ,headerShown: false}} />
          <Stack.Screen name="AdminLanding" component={AdminLandingScreen} options={{ title: "AdminLanding" ,headerShown: false}} />
          <Stack.Screen name="AdminBoardings" component={AdminBoardingsScreen} options={{ title: "AdminBoardings" ,headerShown: false}} />
          <Stack.Screen name="AdminUsers" component={AdminUsersScreen} options={{ title: "AdminUsers" ,headerShown: false}} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}