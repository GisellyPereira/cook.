import { resolveIngredient } from '../src/features/recipes/domain/ingredients';
import { Recipe } from '../src/features/recipes/domain/models';

export const recipe: Recipe = {
  id: 'test-chicken',
  name: 'Chicken & Rice',
  image: 'https://example.com/food.jpg',
  area: 'Italian',
  category: 'Chicken',
  instructions: ['Prepare the ingredients.', 'Cook and serve.'],
  ingredients: ['Chicken', 'Rice', 'Tomatoes', 'Cheese', 'Garlic', 'Onion'].map(
    name => ({ ...resolveIngredient(name), measure: '1 cup' }),
  ),
};

export const mealDto = {
  idMeal: '52795',
  strMeal: 'Chicken Handi',
  strMealThumb:
    'https://www.themealdb.com/images/media/meals/wyxwsp1486979827.jpg',
  strCategory: 'Chicken',
  strArea: 'Indian',
  strInstructions: 'Prepare chicken.\r\n\r\nCook gently.',
  strIngredient1: ' Chicken ',
  strMeasure1: '1.2 kg',
  strIngredient2: 'Onion',
  strMeasure2: '5 thinly sliced',
  strIngredient3: 'Tomatoes',
  strMeasure3: '2 finely chopped',
  strIngredient4: null,
  strMeasure4: null,
  strIngredient5: ' ',
  strIngredient20: 'Salt',
  strMeasure20: 'To taste',
  strYoutube: 'https://www.youtube.com/watch?v=test',
  strSource: '',
};
