import { NativeTabs } from "expo-router/unstable-native-tabs";
import { Home, Compass, Users, Award, Settings } from "lucide-react-native";

export default function Navbar() {
  return (
    <NativeTabs className="w-[80%] h-14 bg-gng-primary">
      <NativeTabs.Trigger
        name="achievements/index"
        className="flex flex-row px-2 py-1 gap-1 rounded-pill bg-gng-accent"
      >
        <NativeTabs.Trigger.Icon src={Award} />
        <NativeTabs.Trigger.Label className="text-caption font-sans">
          Achievements
        </NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="nearby/index">
        <NativeTabs.Trigger.Icon src={Compass} />
        <NativeTabs.Trigger.Label className="text-caption font-sans">
          Nearby
        </NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="home/index">
        <NativeTabs.Trigger.Icon src={Home} />
        <NativeTabs.Trigger.Label className="text-caption font-sans">
          Home
        </NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="circles/index">
        <NativeTabs.Trigger.Icon src={Users} />
        <NativeTabs.Trigger.Label className="text-caption font-sans">
          Circles
        </NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings/index">
        <NativeTabs.Trigger.Icon src={Settings} />
        <NativeTabs.Trigger.Label className="text-caption font-sans">
          Settings
        </NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
