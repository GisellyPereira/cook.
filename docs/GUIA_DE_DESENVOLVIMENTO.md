# Guia de desenvolvimento

Este guia complementa o [README do COOK FROM THIS](../README.md) com um roteiro de estudo e instruções para testar as versões nativas.

## Por onde começar a estudar

Leia um arquivo por vez e acompanhe o que acontece quando você interage com o aplicativo:

1. **[App.tsx](../App.tsx):** monta os provedores e entrega os serviços concretos de receitas e armazenamento.
2. **[AppNavigator.tsx](../src/app/AppNavigator.tsx):** controla a tela ativa, os painéis e o histórico de receitas. Observe como estado e callbacks conectam os componentes.
3. **[Button.tsx](../src/shared/components/Button.tsx):** recebe propriedades e chama `onPress`. Compare com [RecipeCard.tsx](../src/features/recipes/components/RecipeCard.tsx), que conhece uma receita e seu percentual.
4. **[matching.ts](../src/features/recipes/domain/matching.ts):** calcula ingredientes presentes, faltantes e compatibilidade sem depender de uma tela.
5. **[TheMealDbRepository.ts](../src/features/recipes/data/TheMealDbRepository.ts):** acessa a API com `fetch`, trata erros e organiza o cache e os lotes. [mealDbMapper.ts](../src/features/recipes/data/mealDbMapper.ts) converte os dados externos.
6. **[KitchenProvider.tsx](../src/features/kitchen/context/KitchenProvider.tsx):** compartilha despensa, salvas e compras entre as telas e aguarda a leitura inicial antes de persistir alterações.
7. **As telas:** comece por [PantryScreen.tsx](../src/features/kitchen/screens/PantryScreen.tsx), depois [DiscoverScreen.tsx](../src/features/recipes/screens/DiscoverScreen.tsx) e [RecipeDetailScreen.tsx](../src/features/recipes/screens/RecipeDetailScreen.tsx).

## Onde colocar um novo arquivo

| Se o código…                                            | Coloque em…                                      |
| ------------------------------------------------------- | ------------------------------------------------ |
| Representa uma regra ou modelo de receitas              | `src/features/recipes/domain`                    |
| Consulta ou converte respostas da API                   | `src/features/recipes/data`                      |
| Mostra uma parte da interface de receitas               | `src/features/recipes/components`                |
| Representa uma tela de receitas                         | `src/features/recipes/screens`                   |
| Trata estado, armazenamento ou interface da cozinha     | A pasta correspondente em `src/features/kitchen` |
| É um elemento básico usado por várias funcionalidades   | `src/shared/components`                          |
| Representa a navegação ou a composição geral do produto | `src/app`                                        |

Reutilização não significa colocar tudo em `shared`. `RecipeCard` pode ser usado em várias telas e continuar dentro de receitas, porque depende desse domínio. Um `Button` básico não conhece receitas e pode atender qualquer funcionalidade.

O `AppHeader` recebe a função `onOpenMenu`; esse nome não cria um menu automaticamente. Ao tocar no botão, o cabeçalho chama a função, e o navegador altera o estado que exibe o painel.

Mantenha funções com uma responsabilidade, nomes claros e cores e medidas centralizadas em [tokens.ts](../src/shared/theme/tokens.ts). Crie uma abstração quando houver uma necessidade concreta.

## Como a descoberta continua

A interface exibe até seis cards. **Ver mais** troca esses cards e volta a rolagem ao início da seção. Ao abrir uma receita e voltar, a página e os filtros são preservados.

A descoberta começa com `search.php?s=` e continua com `search.php?f=a`, depois as demais letras. O hook remove receitas já exploradas e pula grupos sem novidades. Na busca por ingrediente, todos os identificadores recebidos ficam disponíveis para carregamento de detalhes em lotes de 12.

O contrato `RecipeBatch` fornece as receitas e um `nextCursor`. O cursor pertence ao app: a API gratuita não oferece essa paginação pronta. Quando uma consulta falha, a nova tentativa mantém o cursor que falhou.

As relacionadas usam candidatos da mesma categoria e consideram ingredientes em comum e origem para ordenar as sugestões. O app exclui a receita atual e duplicatas. O histórico permite voltar de uma sugestão para a receita anterior.

## Verificações de desenvolvimento

```bash
npm run typecheck
npm run lint
npm test -- --runInBand
npm run doctor
```

Para verificar se os bundles de Android, iOS e web podem ser gerados:

```bash
npx expo export --platform all
```

A exportação não substitui testar gestos, teclado, rede e áreas seguras em aparelhos reais. Para formatar o código, use `npm run format`.

## Splash e Expo Go

O splash nativo é configurado em [app.json](../app.json), com os recursos de marca em `assets/brand`. O aplicativo abre a home assim que as fontes locais e a interface estão prontas.

No Expo Go, o ícone, o nome do projeto e o carregamento da abertura pertencem ao aplicativo de desenvolvimento. Limpar o cache não substitui essa tela pelo splash nativo. Alterações no plugin de splash exigem um novo build. Veja a [documentação do Expo SplashScreen](https://docs.expo.dev/versions/latest/sdk/splash-screen/).

## Build local para Android

Com **Java 17** e **Android SDK** configurados no computador:

```bash
npm run build:android:preview
```

O script gera o projeto Android pelo prebuild, compila a variante `release` e copia o resultado para `dist/cook-from-this-preview.apk`. Ele não inicia um servidor Expo.

Instale o APK no aparelho e abra COOK FROM THIS pelo ícone. O JavaScript está incluído no arquivo; essa versão não precisa de QR Code nem do computador ligado. Buscas e fotos continuam dependendo de internet.

O APK local usa a assinatura de teste do template. Para publicar na Play Store, configure a assinatura de distribuição. Depois de mudar código ou splash, execute o build novamente e instale o APK atualizado.

As pastas `android` e `ios` são geradas e estão no `.gitignore`. Mantenha a configuração em `app.json`; mudanças nativas exigem regeneração e compilação. Alterações manuais nas pastas geradas podem ser sobrescritas pelo prebuild.

## Build para iPhone

No Linux, uma opção é o **EAS Build** na nuvem com uma assinatura Apple Developer ativa e o registro do aparelho. O perfil `preview` de [eas.json](../eas.json) utiliza distribuição interna. Consulte os requisitos na [documentação do Expo](https://docs.expo.dev/build/internal-distribution/).

Com a conta Apple Developer e o EAS CLI disponíveis:

```bash
eas login
eas init
eas device:create
eas build --platform ios --profile preview
```

`eas init` conecta o projeto à conta Expo. `eas device:create` registra o iPhone. A compilação solicita as credenciais Apple e fornece um link de instalação ao terminar. Esses comandos enviam o projeto ao serviço de build.

Outra opção é compilar e assinar localmente em um Mac com Xcode. Durante o desenvolvimento, você pode continuar usando Expo Go com `npx expo start`.
