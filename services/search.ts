import { load as cheerioLoad } from "cheerio";
import type { CheerioAPI } from "cheerio";
import type { Element } from "domhandler";
import qs from "qs";
import fetch2 from "@cch137/format-utils/fetch2";

function isValidURL(url: string) {
  return /^https?:/.test(url);
}

// inspired by "googlethis"
export function google(query: string): Promise<SearcherResultItem[]>;
export function google(queries: string[]): Promise<SearcherResultItem[]>;
export function google(
  queries: string | string[]
): Promise<SearcherResultItem[]>;
export async function google(..._queries: (string[] | string)[]) {
  const queries = _queries.flat(1);
  if (queries.length !== 1)
    return (await Promise.all(queries.map((q) => google(q)))).flat();
  const query = queries[0];

  const res = await fetch2(
    `https://www.google.com/search?q=${encodeURIComponent(query)}`
  );
  const $ = cheerioLoad(await res.text());
  const items = [...$("#main").children("div")];
  items.shift();
  while (items[0].children.length == 0) {
    items.shift();
  }
  return items
    .map((item) => {
      const a = $(item).find("a").first();
      const url =
        (qs.parse((a.attr("href") || "").split("?").at(-1) || "")
          ?.q as string) || "";
      const title = a.find("h3").first().text() || undefined;
      const description =
        $(item).children().last().children().last().text() || undefined;
      if (!isValidURL(url)) return null;
      return { url, title, description };
    })
    .filter((i) => i) as SearcherResultItem[];
}

function googleExtractText(
  $: CheerioAPI,
  el: Element,
  isRoot: boolean = false,
  showUrl: boolean = true
): string {
  try {
    const children = $(el).children("*");
    let href = $(el).prop("href") || undefined;
    if (href && href.startsWith("/search")) throw "no need";
    let text = (
      children.length == 0
        ? $(el).text()
        : [...children]
            .map((c) => googleExtractText($, c, false, showUrl))
            .join("\n")
    ).trim();
    if (href?.startsWith("/url"))
      href = ((qs.parse(href.split("?")[1]) || {}).q as string) || "";
    else href = undefined;
    return `${showUrl && href ? href + "\n" : ""}${text}`;
  } catch (e) {
    if (isRoot) return "";
    else throw e;
  }
}

export function googleSearchToTextV2(query: string): Promise<string>;
export function googleSearchToTextV2(queries: string[]): Promise<string>;
export function googleSearchToTextV2(
  queries: string | string[]
): Promise<string>;
export async function googleSearchToTextV2(..._queries: (string[] | string)[]) {
  const queries = _queries.flat(1);
  if (queries.length !== 1)
    return (
      await Promise.all(queries.map((q) => googleSearchToTextV2(q)))
    ).flat();
  const query = queries[0];

  const res = await fetch2(`https://www.google.com/search?q=${query}`);
  const $ = cheerioLoad(await res.text());
  const items = [...$("#main").children("div")];
  const text = items
    .map((i) => googleExtractText($, i, true))
    .join("\n\n")
    .trim()
    .replace(/(\n{2,})/g, "\n\n");

  return text;
}

export function duckduckgo(query: string): Promise<SearcherResultItem[]>;
export function duckduckgo(queries: string[]): Promise<SearcherResultItem[]>;
export function duckduckgo(
  queries: string | string[]
): Promise<SearcherResultItem[]>;
export async function duckduckgo(..._queries: (string[] | string)[]) {
  const queries = _queries.flat(1);
  if (queries.length !== 1)
    return (await Promise.all(queries.map((q) => duckduckgo(q)))).flat();
  const query = queries[0];

  const region = "wt-wt";
  const timelimit = undefined;
  const safesearch = "off";

  const res1 = await fetch2(
    `https://duckduckgo.com/?${qs.stringify({
      q: query,
      kl: region,
      p: { on: 1, moderate: -1, off: -2 }[safesearch],
      df: timelimit,
    })}`
  );
  const $1 = cheerioLoad(await res1.text());
  const qs1 = qs.parse(
    ($1("#deep_preload_link").attr("href") || "").split("?").at(-1)!
  );
  const qs2 = qs.parse(
    ($1("#deep_preload_script").attr("src") || "").split("?").at(-1)!
  );

  const ddgSeaerchUrl = `https://links.duckduckgo.com/d.js?${qs.stringify({
    ...qs2,
    ...qs1,
    q: query,
    kl: region,
    l: region,
    bing_market: `${region.split("-")[0]}-${(
      region.split("-").at(-1) || ""
    ).toUpperCase()}`,
    s: 0,
    df: timelimit,
    // o: "json",
  })}`;

  const res = await fetch2(ddgSeaerchUrl);

  const regex = /DDG\.pageLayout\.load\('d',(\[.*?\])\);DDG\.duckbar\.load\(/;
  const matches = regex.exec(await res.text());

  if (!matches) return [];

  return (
    JSON.parse(matches[1]) as {
      u?: string;
      t?: string;
      a?: string;
    }[]
  )
    .map((r) => ({
      title: r.t || "",
      description: cheerioLoad(r.a || "").text(),
      url: r.u || "",
    }))
    .filter((r) => isValidURL(r.url));
}

export type SearcherResultItem = {
  title: string;
  description: string;
  url: string;
};

export type SearchEngine = "google" | "ddg";

export type SearchOptions = {
  engine?: SearchEngine;
};

export type SearchTextOptions = SearchOptions & { url?: boolean; v2?: boolean };

export function search(
  query: string,
  options?: SearchOptions
): Promise<SearcherResultItem[]>;
export function search(
  queries: string[],
  options?: SearchOptions
): Promise<SearcherResultItem[]>;
export function search(
  queries: string | string[],
  options?: SearchOptions
): Promise<SearcherResultItem[]>;
export async function search(
  queries: string[] | string,
  options: SearchOptions = {}
) {
  const { engine = "google" } = options;
  switch (engine) {
    case "google":
      return google(queries);
    case "ddg":
      return duckduckgo(queries);
    default:
      return google(queries);
  }
}

export function searchToText(
  query: string,
  options?: SearchTextOptions
): Promise<string>;
export function searchToText(
  queries: string[],
  options?: SearchTextOptions
): Promise<string>;
export function searchToText(
  queries: string | string[],
  options?: SearchTextOptions
): Promise<string>;
export async function searchToText(
  queries: string | string[],
  options: SearchTextOptions = {}
) {
  const { url: showUrl = false, v2 = false, ...searchOptions } = options;
  const { engine } = searchOptions;
  if (!engine || (engine === "google" && v2))
    return googleSearchToTextV2(queries);
  const results = await search(queries, searchOptions);
  return results
    .reduce((uniqued, curr) => {
      if (!uniqued.some(({ url }) => url === curr.url)) uniqued.push(curr);
      return uniqued;
    }, [] as SearcherResultItem[])
    .map(
      ({ title, description, url }) =>
        `${showUrl ? url + "\n" : ""}${title ? title : ""}\n${description}`
    )
    .join("\n\n");
}
