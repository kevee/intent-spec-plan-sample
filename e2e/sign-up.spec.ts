import { expect, test, type Locator, type Page } from '@playwright/test'

import { expectNoAxeViolations } from './axe'

const openShift = async (page: Page, title: string) => {
  await page.goto('/')
  await page.getByRole('link', { name: title }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(title)
}

// Press Tab until the target has focus, or give up after a few tries.
const tabTo = async (page: Page, target: Locator, limit = 12) => {
  for (let i = 0; i < limit; i++) {
    if (await target.evaluate((el) => el === document.activeElement)) return
    await page.keyboard.press('Tab')
  }
  await expect(target).toBeFocused()
}

test('signs a volunteer up and moves focus to the confirmation', async ({
  page
}) => {
  await openShift(page, 'Library book sale setup')
  await expect(page.getByText('2 of 6 spots filled')).toBeVisible()

  await page.getByLabel('Name').fill('Priya Raman')
  await page.getByLabel('Email').fill('priya.raman@example.org')
  await page.getByRole('button', { name: 'Sign up' }).click()

  const status = page.getByRole('status')
  await expect(status).toHaveText(
    /^You're signed up for Library book sale setup on .+ at 10:00 a\.m\.$/
  )
  await expect(status).toBeFocused()
  await expect(page.getByRole('button', { name: 'Sign up' })).toHaveCount(0)
  await expectNoAxeViolations(page)

  await page.goto('/')
  await expect(
    page.getByRole('listitem').filter({ hasText: 'Library book sale setup' })
  ).toContainText('3 of 6 spots filled')
})

test('shows validation errors under their fields', async ({ page }) => {
  await openShift(page, 'Tree planting')
  const form = page.locator('form')

  await page.getByRole('button', { name: 'Sign up' }).click()
  await expect(form.getByRole('alert')).toHaveText([
    'Enter your name.',
    'Enter your email address.'
  ])
  await expect(page.getByLabel('Name')).toHaveAttribute('aria-invalid', 'true')
  await expect(page.getByLabel('Email')).toHaveAttribute('aria-invalid', 'true')
  await expect(page.getByLabel('Email')).toHaveAccessibleDescription(
    'Enter your email address.'
  )
  await expectNoAxeViolations(page)

  await page.getByLabel('Name').fill('Dana Reyes')
  await page.getByLabel('Email').fill('dana')
  await page.getByRole('button', { name: 'Sign up' }).click()
  await expect(form.getByRole('alert')).toHaveText([
    'Enter an email address like name@example.org.'
  ])
  await expect(page.getByLabel('Name')).toHaveValue('Dana Reyes')
  await expect(page.getByLabel('Name')).not.toHaveAttribute('aria-invalid')
  await expect(page.getByText('0 of 12 spots filled')).toBeVisible()
  await expectNoAxeViolations(page)
})

test('completes a sign-up with the keyboard alone', async ({ page }) => {
  await page.goto('/')

  await tabTo(
    page,
    page.getByRole('link', { name: 'Senior center lunch service' })
  )
  await page.keyboard.press('Enter')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Senior center lunch service'
  )

  // After a client-side navigation Next.js puts focus at the top of the new
  // content, so tab forward from there into the form.
  await tabTo(page, page.getByLabel('Name'))
  await page.keyboard.type('Omar Haddad')
  await page.keyboard.press('Tab')
  await expect(page.getByLabel('Email')).toBeFocused()
  await page.keyboard.type('omar.haddad@example.org')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('button', { name: 'Sign up' })).toBeFocused()
  await page.keyboard.press('Enter')

  const status = page.getByRole('status')
  await expect(status).toContainText(
    "You're signed up for Senior center lunch service"
  )
  await expect(status).toBeFocused()
  await expectNoAxeViolations(page)
})
