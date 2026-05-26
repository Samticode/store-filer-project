<template>
  <div class="space-y-6 text-sm leading-relaxed text-gray-700">
    <section aria-labelledby="privacy-gdpr-heading">
      <h3 id="privacy-gdpr-heading" class="text-base font-semibold text-gray-900">
        Personvernerklæring (GDPR / Personopplysningsloven)
      </h3>

      <p class="mt-3">
        <span class="font-medium text-gray-900">Behandlingsansvarlig:</span>
        Store Filer AS
      </p>

      <p class="mt-3">
        Vi behandler personopplysninger for å administrere prosjekter og oppgaver internt,
        tildele arbeid, følge opp fremdrift og dokumentere arbeid som utføres. Dataene brukes
        ikke til formål utenfor prosjekt- og oppgaveoppfølging.
      </p>

      <p class="mt-3 font-medium text-gray-900">Hvilke opplysninger vi lagrer</p>
      <ul class="mt-2 list-disc space-y-1 pl-5">
        <li>Navn og e-postadresse (konto og profil)</li>
        <li>Rolle i systemet (ansatt, prosjektleder eller ledelse)</li>
        <li>Oppgavetildeling og statusendringer</li>
        <li>Arbeidslogg: tekstoppdateringer, tidsstempler, vedlagte bilder og filer</li>
        <li>GitHub-commitmeldinger koblet til oppgaver (når integrasjon er aktivert)</li>
      </ul>

      <p class="mt-3">
        Behandlingen skjer primært for å oppfylle arbeidsavtalen og berettiget interesse knyttet
        til intern prosjektstyring. Tilgang begrenses etter rolle via Firestore Security Rules.
        Data lagres hos Firebase (Google Cloud) i tråd med EUs standardavtaler for dataoverføring.
      </p>

      <p class="mt-3">
        Du har rett til innsyn, retting, sletting, begrensning av behandling og dataportabilitet.
        Kontakt behandlingsansvarlig for å utøve rettighetene, eller klage til Datatilsynet.
      </p>
    </section>

    <section aria-labelledby="privacy-aml-heading">
      <h3 id="privacy-aml-heading" class="text-base font-semibold text-gray-900">
        Informasjon til arbeidstakere (Arbeidsmiljøloven)
      </h3>

      <p class="mt-3">
        Appen loggfører arbeidsaktivitet knyttet til oppgaver du er tildelt: statusendringer,
        tekstoppdateringer, vedlegg og GitHub-commitmeldinger ved push til oppgave-branch.
      </p>

      <p class="mt-3">
        Loggen brukes til prosjektdokumentasjon og oppfølging — ikke til hemmelig overvåkning.
        Du kan se egen aktivitet i oppdateringsloggen på oppgavesiden.
      </p>

      <ul class="mt-3 list-disc space-y-1 pl-5">
        <li>Du — innsyn i egne oppdateringer</li>
        <li>Prosjektleder — godkjenning og oppfølging</li>
        <li>Ledelse — administrasjon og oversikt</li>
      </ul>
    </section>

    <section aria-labelledby="privacy-wcag-heading">
      <h3 id="privacy-wcag-heading" class="text-base font-semibold text-gray-900">
        Universell utforming (WCAG 2.1)
      </h3>
      <p class="mt-3">
        Applikasjonen er utviklet med tilstrekkelig fargekontrast, semantisk HTML og aria-labels
        på ikoner og knapper.
      </p>
    </section>

    <p class="text-xs text-gray-400">Sist oppdatert: mai 2026</p>
  </div>
</template>
