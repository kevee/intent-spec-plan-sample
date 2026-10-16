import AxeBuilder from '@axe-core/playwright'
import { expect, type Page } from '@playwright/test'

// Every page test ends with this. It must report zero violations.
export const expectNoAxeViolations = async (page: Page) => {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze()
  expect(results.violations).toEqual([])
}
