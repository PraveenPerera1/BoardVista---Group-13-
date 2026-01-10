import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import index from "./app/index";
import BoardingDetailsAdding from "./screens/BoardingDetailsAdding";
import ChatScreen from "./screens/ChatScreen";
import Dashboard from "./screens/Dashboard";
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
      UserDashboard: 'user-dashboard',
      BoardingDetailsAdding: 'add-boarding',
      Dashboard: 'dashboard',
      ChatScreen: 'chat',
      ReviewPage: 'review',
    },
  },
};

export default function App() {
  return (
    // 2. Pass the linking prop here
    <NavigationContainer linking={linking}>
      <Stack.Navigator initialRouteName="index">
        <Stack.Screen name="index" component={index} options={{ headerShown: false }} />
        <Stack.Screen name="HomePage" component={HomePage} options={{title:"HomePage",headerShown: false}}/>
        <Stack.Screen name="UserLoginPage" component={UserLoginPage} options={{ title: "LoginUser",headerShown: false }} />
        <Stack.Screen name="OwnerLoginPage" component={OwnerLoginPage} options={{ title: "LoginOwner" ,headerShown: false}} />
        <Stack.Screen name="RegistrationPage" component={RegistrationPage} options={{ title: "Registration" ,headerShown: false}} />
        <Stack.Screen name="UserDashboard" component={UserDashboard} options={{ title: "UserDashboard" }} />
        <Stack.Screen name="BoardingDetailsAdding" component={BoardingDetailsAdding} options={{ title: "BoardingDetailsAdding" ,headerShown: false}} />
        <Stack.Screen name="Dashboard" component={Dashboard} options={{ title: "Dashboard",headerShown: false }} />
        <Stack.Screen name="ChatScreen" component={ChatScreen} options={{ title: "ChatScreen" ,headerShown: false}} />
        <Stack.Screen name="ReviewPage" component={ReviewPage} options={{ title: "ReviewPage" ,headerShown: false}} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}