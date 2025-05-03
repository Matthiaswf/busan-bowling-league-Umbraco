<template>
  <section class="page-section">
    <h2 class="section-title">Latest Posts</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="bg-white rounded shadow p-4">Post 1 (placeholder)</div>
      <div class="bg-white rounded shadow p-4">Post 2 (placeholder)</div>
    </div>
  </section>

  <section class="page-section">
    <h2 class="section-title">Current Standings</h2>
    <div class="bg-white rounded shadow p-4">Standings Table (placeholder)</div>
  </section>

  <section class="page-section">
    <h2 class="section-title">Teams</h2>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="bg-white rounded shadow p-4 text-center">Team A</div>
      <div class="bg-white rounded shadow p-4 text-center">Team B</div>
      <div class="bg-white rounded shadow p-4 text-center">Team C</div>
      <div class="bg-white rounded shadow p-4 text-center">Team D</div>
    </div>
  </section>

  <section class="page-section text-center">
    <NuxtLink to="/standings" class="btn-primary">
      View Full Standings & Schedule →
    </NuxtLink>
  </section>
</template>
