import { describe, it, expect } from 'vitest'
import {
  taskPriorityLabel,
  taskPriorityBadgeClass,
  taskStatusLabel,
  taskStatusBadgeClass,
  statusChangeLogText,
  taskUpdateCardClass,
  taskUpdateAttachmentBorderClass,
  taskUpdateLinkClass,
  taskUpdateStatusTextClass,
  TASK_APPROVAL_UPDATE_TEXT,
  TASK_REJECTION_UPDATE_TEXT,
} from '@/utils/taskLabels'

describe('taskPriorityLabel', () => {
  it.each([
    ['low', 'Lav'],
    ['medium', 'Middel'],
    ['high', 'Høy'],
    ['critical', 'Kritisk'],
  ] as const)('returnerer "%s" for prioritet %s', (priority, expected) => {
    expect(taskPriorityLabel(priority)).toBe(expected)
  })
})

describe('taskPriorityBadgeClass', () => {
  it('returnerer ulike klasser for ulike prioriteter', () => {
    const classes = (['low', 'medium', 'high', 'critical'] as const).map(taskPriorityBadgeClass)
    const unique = new Set(classes)
    expect(unique.size).toBe(4)
  })

  it('critical har rød farge', () => {
    expect(taskPriorityBadgeClass('critical')).toContain('red')
  })
})

describe('taskStatusLabel', () => {
  it.each([
    ['not_started', 'Ikke startet'],
    ['in_progress', 'Pågår'],
    ['pending_approval', 'Til godkjenning'],
    ['approved', 'Godkjent'],
  ] as const)('returnerer "%s" for status %s', (status, expected) => {
    expect(taskStatusLabel(status)).toBe(expected)
  })
})

describe('taskStatusBadgeClass', () => {
  it('returnerer ulike klasser for ulike statuser', () => {
    const statuses = ['not_started', 'in_progress', 'pending_approval', 'approved'] as const
    const classes = statuses.map(taskStatusBadgeClass)
    const unique = new Set(classes)
    expect(unique.size).toBe(4)
  })

  it('approved har grønn farge', () => {
    expect(taskStatusBadgeClass('approved')).toContain('green')
  })
})

describe('statusChangeLogText', () => {
  it.each([
    ['not_started', 'in_progress', 'Begynte oppgaven'],
    ['in_progress', 'pending_approval', 'Sendte oppgaven til godkjenning'],
    ['in_progress', 'not_started', 'Satte oppgaven tilbake til ikke startet'],
    ['pending_approval', 'in_progress', 'Fortsatte arbeidet med oppgaven'],
  ] as const)('fra %s til %s returnerer riktig tekst', (from, to, expected) => {
    expect(statusChangeLogText(from, to)).toBe(expected)
  })

  it('returnerer generisk fallback for ukjent overgang', () => {
    const result = statusChangeLogText('not_started', 'approved')
    expect(result).toContain('Godkjent')
  })
})

describe('taskUpdateCardClass', () => {
  it('approved → grønn ramme', () => {
    expect(taskUpdateCardClass('approved')).toContain('green')
  })

  it('pending_approval → gul ramme', () => {
    expect(taskUpdateCardClass('pending_approval')).toContain('amber')
  })

  it('avvisning (in_progress + avvisningstekst) → rød ramme', () => {
    expect(taskUpdateCardClass('in_progress', TASK_REJECTION_UPDATE_TEXT)).toContain('rose')
  })

  it('vanlig oppdatering (null) → standard ramme', () => {
    const result = taskUpdateCardClass(null)
    expect(result).not.toContain('amber')
    expect(result).not.toContain('rose')
  })
})

describe('taskUpdateAttachmentBorderClass', () => {
  it('approved → emerald kantlinje', () => {
    expect(taskUpdateAttachmentBorderClass('approved')).toContain('emerald')
  })

  it('pending_approval → amber kantlinje', () => {
    expect(taskUpdateAttachmentBorderClass('pending_approval')).toContain('amber')
  })

  it('avvisning → rose kantlinje', () => {
    expect(taskUpdateAttachmentBorderClass('in_progress', TASK_REJECTION_UPDATE_TEXT)).toContain('rose')
  })

  it('standard oppdatering → grønn kantlinje', () => {
    expect(taskUpdateAttachmentBorderClass(null)).toContain('green')
  })
})

describe('taskUpdateLinkClass', () => {
  it('returnerer ulike klasser for approved, pending_approval, avvisning og standard', () => {
    const approved = taskUpdateLinkClass('approved')
    const pending = taskUpdateLinkClass('pending_approval')
    const rejected = taskUpdateLinkClass('in_progress', TASK_REJECTION_UPDATE_TEXT)
    const standard = taskUpdateLinkClass(null)

    expect(new Set([approved, pending, rejected, standard]).size).toBe(3)
  })
})

describe('taskUpdateStatusTextClass', () => {
  it('approved → grønn bold tekst', () => {
    const cls = taskUpdateStatusTextClass('approved')
    expect(cls).toContain('green')
    expect(cls).toContain('font-medium')
  })

  it('pending_approval → amber bold tekst', () => {
    const cls = taskUpdateStatusTextClass('pending_approval')
    expect(cls).toContain('amber')
    expect(cls).toContain('font-medium')
  })

  it('avvisning → rose bold tekst', () => {
    const cls = taskUpdateStatusTextClass('in_progress', TASK_REJECTION_UPDATE_TEXT)
    expect(cls).toContain('rose')
    expect(cls).toContain('font-medium')
  })

  it('standard oppdatering → grå tekst uten bold', () => {
    const cls = taskUpdateStatusTextClass(null)
    expect(cls).toContain('gray')
    expect(cls).not.toContain('font-medium')
  })
})
