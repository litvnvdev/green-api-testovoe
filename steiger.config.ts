import fsd from '@feature-sliced/steiger-plugin';
import { defineConfig } from 'steiger';

export default defineConfig([
  ...fsd.configs.recommended,
  {
    rules: {
      // Эвристика для больших проектов: «слайс используется в одном месте — слейте».
      // Здесь фичи выделены ради изоляции (своя модель, API и UI), а не ради повторного использования.
      'fsd/insignificant-slice': 'off',
    },
  },
]);
