import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Button from '../../../shared/components/Button';
import Chip from '../../../shared/components/Chip';
import EmptyState from '../../../shared/components/EmptyState';
import IconButton from '../../../shared/components/IconButton';
import Screen from '../../../shared/components/Screen';
import SearchInput from '../../../shared/components/SearchInput';
import Sheet from '../../../shared/components/Sheet';
import { useReducedMotion } from '../../../shared/hooks/useReducedMotion';
import { useKitchen } from '../../kitchen/context/KitchenProvider';
import { rankRecipes } from '../domain/matching';
import { Recipe } from '../domain/models';
import { useRecipeSearch } from '../hooks/useRecipeSearch';
import { categoryLabel, colors, fonts } from '../../../shared/theme/tokens';
import FeaturedCarousel from '../components/FeaturedCarousel';
import PantryPreview from '../components/PantryPreview';
import RecipeGrid from '../components/RecipeGrid';
import RecipeSkeleton from '../components/RecipeSkeleton';
import RecipePagination from '../components/RecipePagination';

const PAGE_SIZE = 6;
type MatchFilter = 'all' | 'almost' | 'ready';
type Props = {
  search: ReturnType<typeof useRecipeSearch>;
  onAddIngredients: () => void;
  onOpenRecipe: (recipe: Recipe) => void;
  searchVisible: boolean;
  active: boolean;
};

export default function DiscoverScreen({
  search,
  onAddIngredients,
  onOpenRecipe,
  searchVisible,
  active,
}: Props) {
  const { pantry } = useKitchen();
  const reducedMotion = useReducedMotion();
  const scroll = useRef<ScrollView>(null);
  const resultsY = useRef(0);
  const [mainId, setMainId] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [matchFilter, setMatchFilter] = useState<MatchFilter>('all');
  const [page, setPage] = useState(0);
  const mainIngredient =
    pantry.find(ingredient => ingredient.id === mainId) ?? pantry[0];
  const categories = [
    ...new Set(search.recipes.map(recipe => recipe.category).filter(Boolean)),
  ];
  useEffect(() => {
    setCategory('all');
    setCategoryOpen(false);
    setMatchFilter('all');
    setPage(0);
  }, [search.search]);
  useEffect(() => {
    setPage(0);
  }, [category, matchFilter, pantry]);
  const matches = useMemo(
    () =>
      rankRecipes(search.recipes, pantry).filter(
        match =>
          (category === 'all' || match.recipe.category === category) &&
          (matchFilter === 'all' ||
            (matchFilter === 'almost'
              ? match.missing.length <= 3
              : match.missing.length === 0 && match.available.length > 0)),
      ),
    [search.recipes, pantry, category, matchFilter],
  );
  const pageCount = Math.max(1, Math.ceil(matches.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const visibleMatches = matches.slice(
    currentPage * PAGE_SIZE,
    (currentPage + 1) * PAGE_SIZE,
  );
  const hasNext = currentPage < pageCount - 1 || search.hasMore;
  const featured = search.search.type === 'featured';
  const catalogFinished =
    featured &&
    search.search.type === 'featured' &&
    !!search.search.cursor &&
    !search.hasMore &&
    search.recipes.length === 0;
  const searchLabel =
    search.search.type === 'ingredient'
      ? `Com ${search.search.ingredient.label.toLowerCase()}`
      : search.search.type === 'name'
      ? `Busca: ${search.search.name}`
      : 'ESCOLHA SUA PRÓXIMA RECEITA';

  function showResults() {
    scroll.current?.scrollTo({
      y: Math.max(0, resultsY.current - 12),
      animated: reducedMotion === false,
    });
  }
  function nextPage() {
    if (currentPage < pageCount - 1) {
      setPage(currentPage + 1);
    } else if (search.hasMore) {
      setPage(0);
      search.loadMore();
    } else {
      if (
        featured &&
        search.search.type === 'featured' &&
        search.search.cursor
      ) {
        search.showFeatured();
      } else {
        setPage(0);
      }
    }
    showResults();
  }
  function submitName() {
    if (query.trim()) {
      search.findByName(query);
    }
  }

  return (
    <Screen ref={scroll}>
      <View style={styles.heading}>
        <Text style={styles.eyebrow}>DA SUA COZINHA À MESA</Text>
        <Text style={styles.title}>O que vamos cozinhar?</Text>
      </View>
      {searchVisible && (
        <View style={styles.nameSearch}>
          <SearchInput
            value={query}
            onChangeText={setQuery}
            placeholder="Nome da receita em inglês"
            onSubmit={submitName}
          />
          <Button
            label="Buscar por nome"
            icon="search"
            disabled={!query.trim()}
            onPress={submitName}
          />
          <Text style={styles.hint}>
            Experimente “pasta” ou “chicken”. A busca usa o nome original.
          </Text>
        </View>
      )}
      {(search.featuredRecipes.length > 0 || (featured && search.loading)) && (
        <FeaturedCarousel
          recipes={search.featuredRecipes}
          active={active}
          onOpen={onOpenRecipe}
        />
      )}
      <PantryPreview
        mainIngredient={mainIngredient}
        onSelect={setMainId}
        onAdd={onAddIngredients}
        onFind={() => {
          if (mainIngredient) {
            search.findByIngredient(mainIngredient);
            showResults();
          }
        }}
      />
      <View
        style={styles.recipeSection}
        onLayout={event => {
          resultsY.current = event.nativeEvent.layout.y;
        }}
      >
        <View style={styles.sectionHeading}>
          <View style={styles.sectionCopy}>
            <Text style={styles.eyebrow}>{searchLabel.toUpperCase()}</Text>
            <Text style={styles.sectionTitle}>
              {featured ? 'Para cozinhar hoje' : 'Sua próxima receita'}
            </Text>
          </View>
          <View style={styles.headingActions}>
            {categories.length > 1 && (
              <IconButton
                icon="sliders"
                label="Filtrar categorias"
                active={category !== 'all'}
                onPress={() => setCategoryOpen(true)}
              />
            )}
            {!featured && (
              <IconButton
                icon="rotate-ccw"
                label="Voltar às inspirações"
                onPress={search.showFeatured}
              />
            )}
          </View>
        </View>
        {pantry.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            <Chip
              label="Todas"
              selected={matchFilter === 'all'}
              onPress={() => setMatchFilter('all')}
            />
            <Chip
              label="Faltam até 3"
              selected={matchFilter === 'almost'}
              onPress={() => setMatchFilter('almost')}
            />
            <Chip
              label="Tenho tudo"
              selected={matchFilter === 'ready'}
              onPress={() => setMatchFilter('ready')}
            />
          </ScrollView>
        )}
        {category !== 'all' && (
          <View style={styles.categorySummary}>
            <Chip
              label={categoryLabel(category)}
              selected
              removable
              onPress={() => setCategory('all')}
            />
          </View>
        )}
        {categoryOpen && (
          <Sheet
            visible
            title="Categorias"
            subtitle="Escolha o tipo de receita deste grupo."
            onClose={() => setCategoryOpen(false)}
          >
            <ScrollView contentContainerStyle={styles.categoryOptions}>
              <Chip
                label="Todas as categorias"
                selected={category === 'all'}
                onPress={() => {
                  setCategory('all');
                  setCategoryOpen(false);
                }}
              />
              {categories.map(value => (
                <Chip
                  key={value}
                  label={categoryLabel(value)}
                  selected={category === value}
                  onPress={() => {
                    setCategory(value);
                    setCategoryOpen(false);
                  }}
                />
              ))}
            </ScrollView>
          </Sheet>
        )}
        {search.loading ? (
          <>
            <View style={styles.loadingLabel}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.hint}>Buscando receitas…</Text>
            </View>
            <RecipeSkeleton />
          </>
        ) : search.error ? (
          <EmptyState
            icon="wifi-off"
            title="A cozinha espera por você"
            description={search.error}
            action={{ label: 'Tentar novamente', onPress: search.retry }}
          />
        ) : matches.length === 0 ? (
          <EmptyState
            icon="search"
            title={
              catalogFinished
                ? 'Você explorou todas as receitas disponíveis'
                : 'Ainda não encontramos'
            }
            description={
              catalogFinished
                ? 'Volte ao início para descobrir uma receita ou faça uma nova busca.'
                : search.recipes.length
                ? 'Nenhuma receita combina com esses filtros. Experimente ver todas ou atualize sua cozinha.'
                : 'Experimente outro ingrediente ou busque pelo nome original da receita.'
            }
            action={{
              label: catalogFinished
                ? 'Explorar novamente'
                : search.recipes.length
                ? 'Limpar filtros'
                : 'Ver inspirações',
              onPress: search.recipes.length
                ? () => {
                    setCategory('all');
                    setMatchFilter('all');
                  }
                : search.showFeatured,
            }}
          />
        ) : (
          <>
            <RecipeGrid
              key={`${search.search.type}-${
                search.search.type === 'featured'
                  ? search.search.cursor ?? 'initial'
                  : ''
              }-${currentPage}-${category}-${matchFilter}`}
              matches={visibleMatches}
              onOpen={onOpenRecipe}
            />
          </>
        )}
        {!search.error && !search.loading && matches.length > 0 && (
          <RecipePagination hasNext={hasNext} onNext={nextPage} />
        )}
        {!featured && !search.loading && !search.error && (
          <Text style={styles.hint}>
            A compatibilidade considera os tipos de ingredientes; confira as
            quantidades no preparo.
          </Text>
        )}
      </View>
      <Text style={styles.credit}>Receitas e fotografias · TheMealDB</Text>
    </Screen>
  );
}
const styles = StyleSheet.create({
  heading: { gap: 6, paddingTop: 5 },
  eyebrow: {
    color: colors.accent,
    fontFamily: fonts.bold,
    fontSize: 9,
    letterSpacing: 1.5,
    lineHeight: 15,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 31,
    lineHeight: 38,
    letterSpacing: -0.7,
  },
  nameSearch: { gap: 10 },
  hint: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 18,
  },
  recipeSection: {
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 24,
  },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  sectionCopy: { flex: 1, gap: 5 },
  headingActions: { flexDirection: 'row', gap: 4 },
  categorySummary: { flexDirection: 'row' },
  categoryOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingBottom: 24,
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 27,
    lineHeight: 33,
  },
  filterRow: { gap: 8, paddingRight: 4 },
  loadingLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 18,
  },
  credit: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 10,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
});
