import { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { lotteriesService, Lottery } from '../services/lotteriesService';

export function useLotteries() {
  const [draftLotteries, setDraftLotteries] = useState<Lottery[]>([]);
  const [publishedLotteries, setPublishedLotteries] = useState<Lottery[]>([]);
  const [lottery, setLottery] = useState<Lottery | null>(null);
  const [loading, setLoading] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [filterYear, setFilterYear] = useState<number | "">("");

  const user = auth.currentUser;

  async function loadLotteries() {
    if (!user) return;
    setLoading(true);
    const all = await lotteriesService.fetchLotteriesByUser(user.uid);
    const drafts = all.filter(l => l.status === "draft");
    const published = all.filter(l => l.status === "published");

    // Apply filters here or in pages if desired. For now, just store them.
    let filteredDraft = drafts;
    if (filterName) {
      filteredDraft = filteredDraft.filter(l => l.name.toLowerCase().includes(filterName.toLowerCase()));
    }
    if (filterYear !== "") {
      filteredDraft = filteredDraft.filter(l => l.year === filterYear);
    }

    let filteredPublished = published;
    if (filterName) {
      filteredPublished = filteredPublished.filter(l => l.name.toLowerCase().includes(filterName.toLowerCase()));
    }
    if (filterYear !== "") {
      filteredPublished = filteredPublished.filter(l => l.year === filterYear);
    }

    // Sort published by year descending
    filteredPublished = filteredPublished.sort((a, b) => b.year - a.year);

    setDraftLotteries(filteredDraft);
    setPublishedLotteries(filteredPublished);
    setLoading(false);
  }

  useEffect(() => {
    loadLotteries();
  }, [user, filterName, filterYear]);

  async function createDraftLottery(name: string, year: number): Promise<string> {
    if (!user) throw new Error("Not authenticated");
    const id = await lotteriesService.createDraftLottery(user.uid, name, year);
    await loadLotteries();
    return id;
  }

  async function getLotteryById(id: string) {
    setLoading(true);
    const lot = await lotteriesService.getLottery(id);
    setLottery(lot);
    setLoading(false);
  }

  async function updateLotteryInfo(id: string, name: string, year: number) {
    await lotteriesService.updateLotteryInfo(id, name, year);
    await loadLotteries();
    if (lottery && lottery.id === id) {
      setLottery({ ...lottery, name, year });
    }
  }

  async function addParticipant(id: string, participant: string) {
    await lotteriesService.addParticipantToLottery(id, participant);
    await loadLotteries();
    if (lottery && lottery.id === id) {
      setLottery({ ...lottery, participants: [...lottery.participants, participant] });
    }
  }

  async function removeParticipant(id: string, participant: string) {
    await lotteriesService.removeParticipantFromLottery(id, participant);
    await loadLotteries();
    if (lottery && lottery.id === id) {
      setLottery({ ...lottery, participants: lottery.participants.filter(p => p !== participant) });
    }
  }

  async function publishLottery(id: string) {
    await lotteriesService.publishLottery(id);
    await loadLotteries();
    if (lottery && lottery.id === id) {
      // lottery is now published, if we want to reset it
      setLottery({ ...lottery, status: "published" });
    }
  }

  async function deleteDraftLottery(id: string) {
    await lotteriesService.deleteDraftLottery(id);
    await loadLotteries();
    if (lottery && lottery.id === id) {
      setLottery(null);
    }
  }

  async function copyPublished(id: string, name: string, year: number) {
    if (!user) throw new Error("Not authenticated");
    const newId = await lotteriesService.copyPublishedToDraft(user.uid, id, name, year);
    await loadLotteries();
    return newId;
  }

  return {
    draftLotteries,
    publishedLotteries,
    lottery,
    loading,
    filterName,
    setFilterName,
    filterYear,
    setFilterYear,
    createDraftLottery,
    getLotteryById,
    updateLotteryInfo,
    addParticipant,
    removeParticipant,
    publishLottery,
    deleteDraftLottery,
    copyPublished
  };
}
