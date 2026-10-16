import { expect, test } from '@playwright/test'

import { expectNoAxeViolations } from './axe'

test('lists the upcoming shifts and opens one', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Upcoming shifts'
  )

  // The skip link is the first thing on the page, and it works.
  await page.keyboard.press('Tab')
  await expect(
    page.getByRole('link', { name: 'Skip to main content' })
  ).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('main')).toBeFocused()

  const list = page.getByRole('list')
  await expect(list.getByRole('listitem')).toHaveCount(5)
  const riverside = list.getByRole('listitem').filter({
    hasText: 'Riverside park clean-up'
  })
  await expect(riverside).toContainText('Riverside Park')
  await expect(riverside).toContainText('6 of 10 spots filled')
  await expectNoAxeViolations(page)

  await riverside.getByRole('link', { name: 'Riverside park clean-up' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Riverside park clean-up'
  )
  await expect(page.getByText('6 of 10 spots filled')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Sign up' })).toBeVisible()
  await expectNoAxeViolations(page)
})

test('says in text when a shift is full', async ({ page }) => {
  await page.goto('/')
  const foodBank = page.getByRole('listitem').filter({
    hasText: 'Food bank sorting'
  })
  await expect(foodBank).toContainText('4 of 4 spots filled')
  await expect(foodBank).toContainText('Full')

  await foodBank.getByRole('link', { name: 'Food bank sorting' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Food bank sorting'
  )
  await expect(page.getByRole('status')).toHaveText(
    'This shift is full. If you signed up earlier, your spot is still yours.'
  )
  await expect(page.getByRole('button', { name: 'Sign up' })).toHaveCount(0)
  await expectNoAxeViolations(page)
})

test('returns a 404 for an unknown shift', async ({ page }) => {
  const response = await page.goto('/shifts/not-a-shift')
  expect(response?.status()).toBe(404)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Shift not found'
  )
  await expectNoAxeViolations(page)
})
