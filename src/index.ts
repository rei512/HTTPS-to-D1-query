/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.toml`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
export interface Env {
	// If you set another name in wrangler.toml as the value for 'binding',
	// replace "DB" with the variable name you defined.
	DB: D1Database;
  }
  
  export default {
	async fetch(request, env): Promise<Response> {
	  const { pathname, searchParams} = new URL(request.url);
	  
	  if (pathname === "/api/day.json") {
		// If you did not use `DB` as your binding name, change it here
		const { results } = await env.DB.prepare(
		  "SELECT * FROM day ORDER BY Time DESC LIMIT 140"
		).all();
		return Response.json(results, {headers: {"Access-Control-Allow-Origin": "*"}});
	  }

	  if (pathname === "/api/howmyssl") {
		return new Response("SSL CONNECTION SUCCESSFULLY!", { status: 200 });
	  }

	  if (pathname === "/api/insert") {
		const time = searchParams.get('time');
		const temp = searchParams.get('temp');
		const pres = searchParams.get('pres');
		const humi = searchParams.get('humi');
  
		if (!time || !temp || !pres || !humi) {
		  return new Response("Missing query parameters", { status: 400 });
		}
  
		try {
		  await env.DB.prepare(
			"INSERT INTO day (Time, Temperature, Pressure, Humidity) VALUES (?, ?, ?, ?)"
		  ).bind(time, temp, pres, humi).run();
  
		  return new Response("Data inserted successfully", { status: 200 });
		} catch (error) {
		  return new Response(`Failed to insert data: ${error.message}`, { status: 500 });
		}
	  }
  
	  return new Response(
		"Call /api/beverages to see everyone who works at Bs Beverages"
	  );
	},
  } satisfies ExportedHandler<Env>;