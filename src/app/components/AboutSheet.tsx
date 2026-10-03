import React, { useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../../shared/theme/tokens';
import Button from '../../shared/components/Button';
import BrandWordmark from './BrandWordmark';
import Sheet from '../../shared/components/Sheet';
export default function AboutSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const [linkError, setLinkError] = useState(false);
  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title="COOK FROM THIS"
      subtitle="Uma cozinha com mais possibilidades."
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.brand}>
          <BrandWordmark />
          <Text style={styles.tagline}>
            {'Use o que tem.\nDescubra novos sabores.'}
          </Text>
        </View>
        <Text style={styles.title}>Como encontramos receitas</Text>
        <Text style={styles.text}>
          Você escolhe um ingrediente principal. Buscamos até 24 receitas na
          TheMealDB e conferimos todos os ingredientes delas com a sua cozinha.
          As maiores combinações aparecem primeiro.
        </Text>
        <Text style={styles.title}>O que significa a porcentagem?</Text>
        <Text style={styles.text}>
          Se você tem 4 dos 6 ingredientes diferentes de uma receita, a
          compatibilidade é 67%. Quantidades e substituições precisam ser
          conferidas no preparo. Queijos, tipos de arroz e caldos são tratados
          separadamente. Frango inclui peito e coxa, mas não caldo de frango.
        </Text>
        <Text style={styles.title}>Receitas do mundo</Text>
        <Text style={styles.text}>
          As fotos, os nomes, as medidas e as instruções vêm da TheMealDB. O
          conteúdo original costuma estar em inglês. Ingredientes conhecidos
          aparecem traduzidos; os outros mantêm o nome da fonte.
        </Text>
        <Text style={styles.title}>Seu caderno fica aqui</Text>
        <Text style={styles.text}>
          Sua despensa, as receitas salvas e a lista de compras ficam neste
          aparelho. Você pode consultar receitas salvas sem internet; buscas,
          fotos e links precisam de conexão. Não há conta ou sincronização entre
          dispositivos.
        </Text>
        <Button
          label="Conhecer a TheMealDB"
          icon="external-link"
          variant="secondary"
          onPress={() => {
            setLinkError(false);
            Linking.openURL('https://www.themealdb.com/api.php').catch(() =>
              setLinkError(true),
            );
          }}
        />
        {linkError && (
          <Text style={styles.text}>
            Não foi possível abrir o site. Tente novamente.
          </Text>
        )}
        <Text style={styles.version}>Projeto de portfólio · versão 1.0</Text>
      </ScrollView>
    </Sheet>
  );
}
const styles = StyleSheet.create({
  content: {
    gap: 15,
    paddingBottom: 22,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    backgroundColor: colors.primarySoft,
    borderRadius: 20,
    padding: 22,
    marginBottom: 10,
  },
  tagline: {
    color: colors.primary,
    fontSize: 18,
    lineHeight: 25,
    fontFamily: fonts.bold,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontFamily: fonts.bold,
  },
  text: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 22,
    fontFamily: fonts.regular,
  },
  version: {
    color: colors.muted,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 8,
    fontFamily: fonts.regular,
  },
});
