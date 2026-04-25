import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';
import { BottomSheet } from './BottomSheet';
import { Button } from './Button';
import { colors, spacing, typography } from '../theme';
import type { RootStackParamList } from '../navigation/types';

type Props = {
  visible: boolean;
  mensagem: string;
  onClose: () => void;
};

export function UpgradePrompt({ visible, mensagem, onClose }: Props) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  function fazerUpgrade() {
    onClose();
    navigation.navigate('Upgrade');
  }

  return (
    <BottomSheet visible={visible} titulo="GadoApp Pro" onClose={onClose}>
      <View style={styles.body}>
        <Text style={styles.emoji}>🚀</Text>
        <Text style={styles.msg}>{mensagem}</Text>
        <View style={styles.botoes}>
          <Button label="Fazer upgrade" onPress={fazerUpgrade} />
          <Button label="Agora não" variant="ghost" onPress={onClose} />
        </View>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  body: { gap: spacing.md, alignItems: 'stretch' },
  emoji: { fontSize: 48, textAlign: 'center' },
  msg: {
    ...typography.body,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  botoes: { gap: spacing.sm },
});
