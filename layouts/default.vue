<template>
  <div>
    <!-- Two-Row Navbar -->
    <header class="bg-blue-700 text-white shadow">
      <!-- Top row: logo and title -->
      <div class="container mx-auto flex justify-between items-center p-4">
        <NuxtLink to="/" class="text-xl font-bold">🏆 BBL</NuxtLink>
      </div>

      <!-- Second row: centered nav links -->
      <div class="bg-blue-800">
        <nav class="container mx-auto flex justify-center gap-6 py-2 text-sm">
          <NuxtLink to="/standings" class="hover:underline">Standings</NuxtLink>
          <NuxtLink to="/teams" class="hover:underline">Teams</NuxtLink>
          <NuxtLink to="/players" class="hover:underline">Players</NuxtLink>
        </nav>
      </div>
    </header>

    <!-- Main content -->
    <main class="page-container">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="site-footer">
      © {{ new Date().getFullYear() }} Busan Bowling League
    </footer>
  </div>
</template>
