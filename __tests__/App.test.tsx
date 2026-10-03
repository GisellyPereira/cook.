import React from 'react';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  jest,
  test,
} from '@jest/globals';
import { Modal, TextInput } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';
import {
  emptyKitchen,
  KitchenState,
  KitchenStorage,
} from '../src/features/kitchen/domain/models';
import { resolveIngredient } from '../src/features/recipes/domain/ingredients';
import {
  RecipeBatch,
  RecipeRepository,
} from '../src/features/recipes/domain/models';
import { recipe } from './fixtures';

describe('jornada do COOK FROM THIS', () => {
  let app: ReactTestRenderer.ReactTestRenderer;
  let snapshot: KitchenState;
  let storage: KitchenStorage;
  let repository: RecipeRepository;

  beforeEach(() => {
    snapshot = emptyKitchen();
    storage = {
      load: jest.fn(async () => snapshot),
      save: jest.fn(async (state: KitchenState) => {
        snapshot = state;
      }),
    };
    repository = {
      featured: jest.fn(async () => ({ recipes: [recipe] })),
      byIngredient: jest.fn(async () => ({ recipes: [recipe] })),
      byName: jest.fn(async () => [recipe]),
      related: jest.fn(async () => []),
    };
  });
  afterEach(async () => {
    if (app) {
      await ReactTestRenderer.act(async () => app.unmount());
    }
  });

  async function mount() {
    await ReactTestRenderer.act(async () => {
      app = ReactTestRenderer.create(
        <App repository={repository} storage={storage} />,
      );
    });
  }
  function findButton(label: string) {
    const button = app.root
      .findAll(node => typeof node.props.onPress === 'function')
      .find(node => node.props.accessibilityLabel === label);
    if (!button) {
      throw new Error(`Botão não encontrado: ${label}`);
    }
    return button;
  }
  async function press(label: string) {
    await ReactTestRenderer.act(async () => findButton(label).props.onPress());
  }
  function hasText(text: string) {
    expect(JSON.stringify(app.toJSON())).toContain(text);
  }

  test('despensa → busca real → favorita → ingredientes faltantes → compras', async () => {
    await mount();
    await press('Montar minha cozinha');
    await press('Frango');
    await press('Arroz');
    await press('Pronto · 2 ingredientes');
    expect(snapshot.pantry.map(item => item.id)).toEqual(['chicken', 'rice']);
    await press('Encontrar receitas');
    expect(repository.byIngredient).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'chicken' }),
      expect.anything(),
      undefined,
    );
    await press('Ver receita Chicken & Rice');
    hasText('Vamos preparar?');
    await press('Salvar nos favoritos');
    expect(snapshot.favorites).toEqual([recipe]);
    await press('Adicionar o que falta');
    await press('Itens adicionados à lista');
    expect(snapshot.shopping.map(item => item.label)).toEqual([
      'Tomate',
      'Queijo',
      'Alho',
      'Cebola',
    ]);
    expect(snapshot.shopping).toHaveLength(4);
    await press('Ver lista de compras');
    await press('Comprado: Alho');
    await press('Guardar comprados na cozinha');
    expect(snapshot.pantry.some(item => item.id === 'garlic')).toBe(true);
    expect(snapshot.shopping).toHaveLength(3);
    await press('Salvas');
    await press('Ver receita Chicken & Rice');
    await press('Remover dos favoritos');
    expect(snapshot.favorites).toEqual([]);
    await press('Voltar às receitas');
    hasText('Guarde o que deu vontade');
  });

  test('menu e abas compartilham o estado e a despensa pode ser editada', async () => {
    snapshot.pantry = [resolveIngredient('Tomatoes')];
    await mount();
    await press('Abrir menu');
    expect(app.root.findByType(Modal).props.visible).toBe(true);
    await press('Ir para Cozinha');
    expect(app.root.findAllByType(Modal)).toHaveLength(0);
    expect(findButton('Cozinha').props.accessibilityState.selected).toBe(true);
    await press('Remover Tomate');
    expect(snapshot.pantry).toEqual([]);
    await press('Descobrir');
    await press('Abrir menu');
    await ReactTestRenderer.act(async () =>
      app.root.findByType(Modal).props.onRequestClose(),
    );
    expect(app.root.findAllByType(Modal)).toHaveLength(0);
  });

  test('filtros mostram estado vazio e podem voltar a todas as receitas', async () => {
    snapshot.pantry = [resolveIngredient('Chicken')];
    await mount();
    await press('Tenho tudo');
    hasText('Ainda não encontramos');
    await press('Limpar filtros');
    findButton('Ver receita Chicken & Rice');
    await press('Ver receita Chicken & Rice');
    await press('Já tenho Arroz');
    expect(snapshot.pantry.map(item => item.id)).toEqual(['chicken', 'rice']);
    await press('Remover Frango da cozinha');
    expect(snapshot.pantry.map(item => item.id)).toEqual(['rice']);
  });

  test('busca pelo nome e oferece nova tentativa quando a API falha', async () => {
    repository.byName = jest
      .fn<RecipeRepository['byName']>()
      .mockRejectedValueOnce(new Error('Confira sua internet'))
      .mockResolvedValue([recipe]);
    await mount();
    await press('Buscar receita pelo nome');
    await ReactTestRenderer.act(async () =>
      app.root.findByType(TextInput).props.onChangeText('chicken'),
    );
    await press('Buscar por nome');
    hasText('Confira sua internet');
    await press('Tentar novamente');
    findButton('Ver receita Chicken & Rice');
    expect(repository.byName).toHaveBeenCalledTimes(2);
  });

  test('uma resposta antiga não substitui o resultado da busca mais recente', async () => {
    let finishOld: (batch: RecipeBatch) => void = () => {};
    repository.featured = jest.fn(
      async () =>
        new Promise<RecipeBatch>(resolve => {
          finishOld = resolve;
        }),
    );
    const newest = { ...recipe, id: 'new', name: 'Pasta Primavera' };
    repository.byName = jest.fn(async () => [newest]);
    await mount();
    await press('Buscar receita pelo nome');
    await ReactTestRenderer.act(async () =>
      app.root.findByType(TextInput).props.onChangeText('pasta'),
    );
    await press('Buscar por nome');
    await ReactTestRenderer.act(async () => finishOld({ recipes: [recipe] }));
    findButton('Ver receita Pasta Primavera');
    expect(
      app.root.findAll(
        node => node.props.accessibilityLabel === 'Ver receita Chicken & Rice',
      ),
    ).toHaveLength(0);
  });

  test('aguarda a leitura local antes de salvar, preserva favoritos após reabrir', async () => {
    let finishLoad: (state: KitchenState) => void = () => {};
    storage.load = jest.fn(
      async () =>
        new Promise<KitchenState>(resolve => {
          finishLoad = resolve;
        }),
    );
    await mount();
    expect(storage.save).not.toHaveBeenCalled();
    await ReactTestRenderer.act(async () =>
      finishLoad({
        pantry: [resolveIngredient('Rice')],
        favorites: [recipe],
        shopping: [],
      }),
    );
    expect(snapshot.favorites).toEqual([recipe]);
    await press('Salvas');
    findButton('Ver receita Chicken & Rice');
    await ReactTestRenderer.act(async () => app.unmount());
    storage.load = jest.fn(async () => snapshot);
    await mount();
    await press('Salvas');
    await press('Ver receita Chicken & Rice');
    hasText('Cook and serve.');
  });

  test('falha ao ler dados locais não causa gravação de uma cozinha vazia', async () => {
    storage.load = jest
      .fn<KitchenStorage['load']>()
      .mockRejectedValueOnce(new Error('storage unavailable'))
      .mockResolvedValue({
        pantry: [resolveIngredient('Rice')],
        favorites: [],
        shopping: [],
      });
    await mount();
    hasText('Não conseguimos abrir sua cozinha');
    expect(storage.save).not.toHaveBeenCalled();
    await press('Tentar abrir novamente');
    expect(snapshot.pantry[0].label).toBe('Arroz');
  });

  test('falha ao salvar permanece visível e permite tentar salvar novamente', async () => {
    storage.save = jest
      .fn<KitchenStorage['save']>()
      .mockRejectedValueOnce(new Error('disk full'))
      .mockImplementation(async state => {
        snapshot = state;
      });
    await mount();
    hasText('Não foi possível guardar suas últimas alterações.');
    await press('Tentar salvar');
    expect(storage.save).toHaveBeenCalledTimes(2);
    expect(JSON.stringify(app.toJSON())).not.toContain(
      'Não foi possível guardar suas últimas alterações.',
    );
  });

  test('carregar mais substitui seis cartões e continua além das 25 receitas iniciais', async () => {
    const recipes = Array.from({ length: 25 }, (_, index) => ({
      ...recipe,
      id: String(index),
      name: `Recipe ${String(index).padStart(2, '0')}`,
    }));
    repository.featured = jest.fn(async () => ({ recipes, nextCursor: 'a' }));
    await mount();
    const visibleCards = () =>
      app.root
        .findAll(
          node =>
            typeof node.props.onPress === 'function' &&
            /^Ver receita Recipe/.test(node.props.accessibilityLabel ?? ''),
        )
        .map(node => node.props.accessibilityLabel);
    expect(visibleCards()).toHaveLength(6);
    expect(visibleCards()).toContain('Ver receita Recipe 00');
    await press('Carregar mais');
    expect(visibleCards()).toHaveLength(6);
    expect(visibleCards()).toContain('Ver receita Recipe 06');
    expect(visibleCards()).not.toContain('Ver receita Recipe 00');
    expect(repository.featured).toHaveBeenCalledTimes(1);
    await press('Ver receita Recipe 06');
    await press('Voltar às receitas');
    expect(visibleCards()).toContain('Ver receita Recipe 06');
    expect(visibleCards()).not.toContain('Ver receita Recipe 00');
    await press('Carregar mais');
    await press('Carregar mais');
    await press('Carregar mais');
    expect(visibleCards()).toEqual(['Ver receita Recipe 24']);
    repository.featured = jest.fn(async () => ({
      recipes: [
        recipes[0],
        ...Array.from({ length: 12 }, (_, index) => ({
          ...recipe,
          id: `next-${index}`,
          name: `Another recipe ${String(index).padStart(2, '0')}`,
        })),
      ],
      nextCursor: 'b',
    }));
    await press('Carregar mais');
    expect(repository.featured).toHaveBeenCalledWith(expect.anything(), 'a');
    findButton('Ver receita Another recipe 00');
    expect(visibleCards()).toHaveLength(0);
    await press('Carregar mais');
    findButton('Ver receita Another recipe 06');
    expect(
      app.root.findAll(node =>
        /^Ver receita Recipe/.test(node.props.accessibilityLabel ?? ''),
      ),
    ).toHaveLength(0);
  });

  test('pula grupos já explorados e apresenta o fim real do catálogo', async () => {
    repository.featured = jest
      .fn<RecipeRepository['featured']>()
      .mockResolvedValueOnce({ recipes: [recipe], nextCursor: 'a' })
      .mockResolvedValueOnce({ recipes: [recipe], nextCursor: 'b' })
      .mockResolvedValueOnce({
        recipes: [{ ...recipe, id: 'fresh', name: 'Fresh recipe' }],
        nextCursor: 'c',
      })
      .mockResolvedValueOnce({ recipes: [recipe] });
    await mount();
    await press('Carregar mais');
    findButton('Ver receita Fresh recipe');
    expect(repository.featured).toHaveBeenCalledTimes(3);
    await press('Carregar mais');
    hasText('Você explorou todas as receitas disponíveis');
    findButton('Explorar novamente');
  });

  test('continua a busca por ingrediente e repete o cursor quando o próximo lote falha', async () => {
    snapshot.pantry = [resolveIngredient('Chicken')];
    repository.byIngredient = jest
      .fn<RecipeRepository['byIngredient']>()
      .mockResolvedValueOnce({ recipes: [recipe], nextCursor: '12' })
      .mockRejectedValueOnce(new Error('Sem conexão'))
      .mockResolvedValueOnce({
        recipes: [{ ...recipe, id: 'later', name: 'Later recipe' }],
      });
    await mount();
    await press('Encontrar receitas');
    await press('Carregar mais');
    hasText('Sem conexão');
    await press('Tentar novamente');
    findButton('Ver receita Later recipe');
    expect(
      (
        repository.byIngredient as jest.Mock<RecipeRepository['byIngredient']>
      ).mock.calls.map(call => call[2]),
    ).toEqual([undefined, '12', '12']);
    hasText('Você chegou ao fim destas receitas.');
  });

  test('mudar filtros reinicia a página e a falha no próximo grupo permite repetir o cursor', async () => {
    repository.featured = jest
      .fn<RecipeRepository['featured']>()
      .mockResolvedValueOnce({
        recipes: Array.from({ length: 12 }, (_, index) => ({
          ...recipe,
          id: String(index),
          name: `Recipe ${index}`,
          category: index < 6 ? 'Chicken' : 'Pasta',
        })),
        nextCursor: 'a',
      })
      .mockRejectedValueOnce(new Error('Sem conexão'))
      .mockResolvedValueOnce({ recipes: [recipe], nextCursor: 'b' });
    await mount();
    await press('Carregar mais');
    await press('Filtrar categorias');
    await press('Massas');
    findButton('Ver receita Recipe 6');
    await press('Carregar mais');
    hasText('Sem conexão');
    await press('Tentar novamente');
    findButton('Ver receita Chicken & Rice');
    expect(
      (
        repository.featured as jest.Mock<RecipeRepository['featured']>
      ).mock.calls
        .slice(1)
        .map(call => call[1]),
    ).toEqual(['a', 'a']);
  });

  test('abre a home diretamente e o menu não oferece uma segunda abertura', async () => {
    await mount();
    findButton('Montar minha cozinha');
    expect(JSON.stringify(app.toJSON())).not.toContain('Entrar na cozinha');
    expect(JSON.stringify(app.toJSON())).not.toContain('O PRAZER DE COZINHAR');
    await press('Abrir menu');
    await press('Sobre o COOK FROM THIS');
    expect(JSON.stringify(app.toJSON())).not.toContain('Rever abertura');
  });

  test('abre uma relacionada e volta à receita anterior antes de retornar à home', async () => {
    const second = {
      ...recipe,
      id: 'second',
      name: 'Tomato Chicken',
      instructions: ['Prepare the second recipe.'],
    };
    repository.featured = jest.fn(async () => ({ recipes: [recipe, second] }));
    await mount();
    await press('Ver receita Chicken & Rice');
    hasText('Você também pode gostar');
    await press('Ver receita relacionada Tomato Chicken');
    hasText('Prepare the second recipe.');
    await press('Voltar à receita anterior');
    hasText('Cook and serve.');
    expect(JSON.stringify(app.toJSON())).not.toContain(
      'Prepare the second recipe.',
    );
    await press('Voltar às receitas');
    expect(JSON.stringify(app.toJSON())).not.toContain('Cook and serve.');
    expect(repository.featured).toHaveBeenCalledTimes(1);
  });

  test('falha nas relacionadas não bloqueia o preparo e permite nova tentativa', async () => {
    const second = { ...recipe, id: 'related', name: 'Chicken stew' };
    repository.related = jest
      .fn<RecipeRepository['related']>()
      .mockRejectedValueOnce(new Error('Sem internet'))
      .mockResolvedValueOnce([second]);
    await mount();
    await press('Ver receita Chicken & Rice');
    hasText('Cook and serve.');
    hasText('Não conseguimos buscar outras receitas.');
    await press('Tentar buscar relacionadas');
    findButton('Ver receita relacionada Chicken stew');
  });
});
