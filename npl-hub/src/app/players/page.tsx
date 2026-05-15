import type { Metadata } from "next";
import { getAllPlayers } from "@/lib/db";
import { PlayersClient } from "./PlayersClient";

export const metadata: Metadata = { title: "Players" };
export const revalidate = 3600;

export default async function PlayersPage() {
  const players = await getAllPlayers();
  return <PlayersClient players={players} />;
}
