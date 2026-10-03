import React from 'react';
import { afterEach, beforeEach, expect, jest, test } from '@jest/globals';
import { AccessibilityInfo } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import FeaturedCarousel from '../src/features/recipes/components/FeaturedCarousel';
import { recipe } from './fixtures';

let carousel: ReactTestRenderer.ReactTestRenderer;
const recipes = [
  recipe,
  { ...recipe, id: 'two', name: 'Second recipe' },
  { ...recipe, id: 'three', name: 'Third recipe' },
];
const onOpen = jest.fn();
beforeEach(() => {
  jest.useFakeTimers();
  jest.mocked(AccessibilityInfo.isReduceMotionEnabled).mockResolvedValue(false);
});
afterEach(async () => {
  if (carousel) {
    await ReactTestRenderer.act(async () => carousel.unmount());
  }
  jest.useRealTimers();
});
async function mount() {
  await ReactTestRenderer.act(async () => {
    carousel = ReactTestRenderer.create(
      <FeaturedCarousel recipes={recipes} active onOpen={onOpen} />,
    );
  });
  await ReactTestRenderer.act(async () => {
    carousel.root
      .findByProps({ testID: 'featured-carousel' })
      .props.onLayout({ nativeEvent: { layout: { width: 346 } } });
  });
}
function position(index: number) {
  expect(
    carousel.root.findAllByProps({
      accessibilityLabel: `Destaque ${index} de 3`,
    }).length,
  ).toBeGreaterThan(0);
}
async function press(label: string) {
  const button = carousel.root.findAll(
    node =>
      node.props.accessibilityLabel === label &&
      typeof node.props.onPress === 'function',
  )[0];
  await ReactTestRenderer.act(async () => button.props.onPress());
}
test('alterna, permite escolher pelos dots e retoma sem controle de play', async () => {
  await mount();
  await ReactTestRenderer.act(async () => jest.advanceTimersByTime(6000));
  position(2);
  await press('Mostrar destaque 3: Third recipe');
  position(3);
  await ReactTestRenderer.act(async () => jest.advanceTimersByTime(6000));
  position(3);
  await ReactTestRenderer.act(async () => jest.advanceTimersByTime(6000));
  await ReactTestRenderer.act(async () => jest.advanceTimersByTime(6000));
  position(1);
  await ReactTestRenderer.act(async () => {
    carousel.update(
      <FeaturedCarousel recipes={recipes} active={false} onOpen={onOpen} />,
    );
  });
  await ReactTestRenderer.act(async () => jest.advanceTimersByTime(12000));
  position(1);
});
test('respeita reduzir movimento e abre a receita correspondente ao destaque', async () => {
  jest.mocked(AccessibilityInfo.isReduceMotionEnabled).mockResolvedValue(true);
  await mount();
  await ReactTestRenderer.act(async () => jest.advanceTimersByTime(18000));
  position(1);
  await press('Mostrar destaque 2: Second recipe');
  await press('Explorar destaque Second recipe');
  expect(onOpen).toHaveBeenCalledWith(recipes[1]);
});
