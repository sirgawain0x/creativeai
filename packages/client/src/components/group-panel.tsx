import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Input } from './ui/input';
import { apiClient } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { type Agent, AgentStatus } from '@elizaos/core';
import { UUID } from 'crypto';
import { GROUP_CHAT_SOURCE } from '@/constants';
import { useRooms } from '@/hooks/use-query-hooks';
import MultiSelectCombobox from './combobox';

// Define the Option type to match what MultiSelectCombobox expects
interface Option {
  icon: string;
  label: string;
  id?: string; // We'll add this to track agent IDs
}

interface GroupPanel {
  agents: Agent[] | undefined;
  onClose: () => void;
  groupId?: UUID;
}

export default function GroupPanel({ onClose, agents, groupId }: GroupPanel) {
  const [chatName, setChatName] = useState(``);
  const [selectedAgents, setSelectedAgents] = useState<Agent[]>([]);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [initialOptions, setInitialOptions] = useState<Option[]>([]);

  const { data: roomsData } = useRooms();

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    if (groupId) {
      const rooms = roomsData?.get(groupId);
      if (!rooms || !rooms.length) {
        return;
      }
      setChatName(rooms[0].name || '');

      // Pre-select agents that are already in the room
      if (agents) {
        const roomAgentIds = rooms.map((room) => room.agentId).filter(Boolean);
        const roomAgents = agents.filter((agent) => roomAgentIds.includes(agent.id));

        setSelectedAgents(roomAgents);

        // Create initial options for the combobox
        const options = roomAgents.map((agent) => ({
          icon: agent.settings?.avatar || '',
          label: agent.name,
          id: agent.id,
        }));

        setInitialOptions(options);
      }
    }
  }, [groupId, roomsData, agents]);

  // Create the options for the combobox
  const getComboboxOptions = () => {
    return (
      agents
        ?.filter((agent) => agent.status === AgentStatus.ACTIVE)
        .map((agent) => ({
          icon: agent.settings?.avatar || '',
          label: agent.name,
          id: agent.id,
        })) || []
    );
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <Card
        className="flex flex-col items-center gap-6 justify-between h-[70vh] w-[70vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex gap-3 items-center justify-center w-full px-2 py-4">
          <h1 className="text-xl">{groupId ? 'Edit Group Chat' : 'Create Group Chat'}</h1>
        </div>

        <CardContent className="w-full flex grow flex-col items-center">
          <div className="rounded-md w-full mb-3">
            <div className="flex h-full">
              <div className="p-6 flex flex-col gap-4 w-full">
                <div className="flex flex-col gap-2 w-full">
                  <div className="font-light">Chat Name</div>
                  <Input
                    value={chatName}
                    onChange={(e) => setChatName(e.target.value)}
                    className="w-full"
                    placeholder="Enter room name"
                  />
                </div>
                <div className="font-light">Invite Agents</div>
                <MultiSelectCombobox
                  options={getComboboxOptions()}
                  onSelect={(selected) => {
                    if (agents) {
                      // Convert selected options back to Agent objects by matching on label (name)
                      const selectedAgentObjects = agents.filter((agent) =>
                        selected.some((option) => option.label === agent.name)
                      );
                      setSelectedAgents(selectedAgentObjects);
                    }
                  }}
                  className="w-full"
                  initialSelected={initialOptions}
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center w-full grow gap-4">
            <Button
              variant={'default'}
              className={`w-[90%]`}
              onClick={async () => {
                const serverId = groupId || (crypto.randomUUID() as UUID);
                if (!chatName || !chatName.length) {
                  return;
                }
                setCreating(true);
                try {
                  if (selectedAgents.length > 0) {
                    if (groupId) {
                      try {
                        await apiClient.deleteGroupChat(groupId);
                      } catch (error) {
                        console.error(error);
                      }
                    }
                    await apiClient.createGroupChat(
                      selectedAgents.map((agent) => agent.id as string),
                      chatName,
                      serverId,
                      GROUP_CHAT_SOURCE,
                      {}
                    );
                  }
                } catch (error) {
                  console.error('Failed to create room', error);
                } finally {
                  setCreating(false);
                  navigate(`/room/${serverId}`);
                  onClose();
                  queryClient.invalidateQueries({ queryKey: ['rooms'] });
                }
              }}
              size={'default'}
              disabled={!chatName.length || selectedAgents.length === 0 || deleting || creating}
            >
              {creating ? (
                <Loader2 className="animate-spin" />
              ) : groupId ? (
                'Update Group'
              ) : (
                'Create Group'
              )}
            </Button>
            {groupId && (
              <Button
                variant={'secondary'}
                className={`w-[90%] text-red-500`}
                onClick={async () => {
                  setDeleting(true);
                  try {
                    await apiClient.deleteGroupChat(groupId);
                  } catch (error) {
                    console.error('Failed to delete room', error);
                  } finally {
                    setDeleting(false);
                    navigate(`/`);
                    onClose();
                    queryClient.invalidateQueries({ queryKey: ['rooms'] });
                  }
                }}
                size={'default'}
                disabled={deleting || creating}
              >
                {deleting ? <Loader2 className="animate-spin" /> : 'Delete Group'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
