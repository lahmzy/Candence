import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

const ListHeading = ({ title, onActionPress }: ListHeadingProps) => {
    const router = useRouter();

    const handlePress = () => {
        if (onActionPress) {
            onActionPress();
        } else {
            router.push('/(tabs)/subscriptions' as any);
        }
    };

    return (
        <View className="list-head">
            <Text className="list-title">{title}</Text>

            <TouchableOpacity className="list-action" onPress={handlePress}>
                <Text className="list-action-text">View all</Text>
            </TouchableOpacity>
        </View>
    );
};

export default ListHeading;