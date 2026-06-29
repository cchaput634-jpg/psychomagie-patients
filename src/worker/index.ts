/**
 * Worker unique : sert l'API (/api/*) + la base D1, et délègue tout le
 * reste (le frontend React compilé) au binding ASSETS.
 *
 * En dev, le plugin @cloudflare/vite-plugin exécute ce worker à l'intérieur
 * du serveur Vite → un seul serveur, un seul port, hot-reload + base D1.
 */

interface Env {
  DB: D1Database
  ASSETS: Fetcher
}

const JSON_HEADERS = { 'Content-Type': 'application/json' }

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS })
}
function fail(message: string, status = 500): Response {
  return json({ error: message }, status)
}
function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    const path = url.pathname

    // Tout ce qui n'est pas /api → frontend statique.
    if (!path.startsWith('/api/')) {
      return env.ASSETS.fetch(request)
    }

    try {
      // ---------- /api/profiles ----------
      if (path === '/api/profiles') {
        if (request.method === 'GET') {
          const { results } = await env.DB.prepare(
            `SELECT p.id, p.name, p.created_at,
                    (SELECT COUNT(*) FROM patients WHERE profile_id = p.id) AS patient_count
             FROM profiles p ORDER BY p.created_at ASC`,
          ).all()
          return json(results)
        }
        if (request.method === 'POST') {
          const { name } = await request.json<{ name: string }>()
          if (!name?.trim()) return fail('Nom requis', 400)
          const id = uid()
          await env.DB.prepare('INSERT INTO profiles (id, name) VALUES (?, ?)')
            .bind(id, name.trim())
            .run()
          return json({ id, name: name.trim(), patient_count: 0 })
        }
      }

      // ---------- /api/profiles/:id ----------
      const profileMatch = path.match(/^\/api\/profiles\/([^/]+)$/)
      if (profileMatch) {
        const id = decodeURIComponent(profileMatch[1])
        if (request.method === 'PATCH') {
          const { name } = await request.json<{ name: string }>()
          if (!name?.trim()) return fail('Nom requis', 400)
          await env.DB.prepare('UPDATE profiles SET name = ? WHERE id = ?')
            .bind(name.trim(), id)
            .run()
          return json({ ok: true })
        }
        if (request.method === 'DELETE') {
          await env.DB.prepare('DELETE FROM patients WHERE profile_id = ?').bind(id).run()
          await env.DB.prepare('DELETE FROM profiles WHERE id = ?').bind(id).run()
          return json({ ok: true })
        }
      }

      // ---------- /api/patients ----------
      if (path === '/api/patients') {
        if (request.method === 'GET') {
          const profileId = url.searchParams.get('profileId')
          if (!profileId) return fail('profileId requis', 400)
          const { results } = await env.DB.prepare(
            'SELECT * FROM patients WHERE profile_id = ? ORDER BY created_at ASC',
          )
            .bind(profileId)
            .all()
          return json(results)
        }
        if (request.method === 'POST') {
          const body = await request.json<{
            profile_id: string
            name: string
            last_seen?: string
            notes?: string
          }>()
          if (!body.profile_id) return fail('profile_id requis', 400)
          if (!body.name?.trim()) return fail('Nom requis', 400)
          const id = uid()
          await env.DB.prepare(
            `INSERT INTO patients (id, profile_id, name, last_seen, notes, priority, rdv_proposed)
             VALUES (?, ?, ?, ?, ?, 0, 0)`,
          )
            .bind(id, body.profile_id, body.name.trim(), body.last_seen ?? '', body.notes ?? '')
            .run()
          const { results } = await env.DB.prepare('SELECT * FROM patients WHERE id = ?')
            .bind(id)
            .all()
          return json(results[0])
        }
      }

      // ---------- /api/patients/:id ----------
      const patientMatch = path.match(/^\/api\/patients\/([^/]+)$/)
      if (patientMatch) {
        const id = decodeURIComponent(patientMatch[1])
        if (request.method === 'PATCH') {
          const body = await request.json<{
            name?: string
            last_seen?: string
            notes?: string
            priority?: boolean
            rdv_proposed?: boolean
          }>()
          const sets: string[] = []
          const values: unknown[] = []
          if (body.name !== undefined) {
            if (!body.name.trim()) return fail('Nom requis', 400)
            sets.push('name = ?')
            values.push(body.name.trim())
          }
          if (body.last_seen !== undefined) {
            sets.push('last_seen = ?')
            values.push(body.last_seen)
          }
          if (body.notes !== undefined) {
            sets.push('notes = ?')
            values.push(body.notes)
          }
          if (body.priority !== undefined) {
            sets.push('priority = ?')
            values.push(body.priority ? 1 : 0)
          }
          if (body.rdv_proposed !== undefined) {
            sets.push('rdv_proposed = ?')
            values.push(body.rdv_proposed ? 1 : 0)
          }
          if (sets.length === 0) return fail('Aucun champ à mettre à jour', 400)
          values.push(id)
          await env.DB.prepare(`UPDATE patients SET ${sets.join(', ')} WHERE id = ?`)
            .bind(...values)
            .run()
          return json({ ok: true })
        }
        if (request.method === 'DELETE') {
          await env.DB.prepare('DELETE FROM patients WHERE id = ?').bind(id).run()
          return json({ ok: true })
        }
      }

      return fail('Route introuvable', 404)
    } catch (e) {
      return fail(String(e))
    }
  },
}
