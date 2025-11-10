import { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Search, MoreVertical, Mail, Phone, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  joinedDate: string;
  avatar: string;
  status: 'active' | 'inactive';
}

const mockMembers: Member[] = [
  { id: '1', name: 'Sarah Chen', email: 'sarah@example.com', phone: '+1 234 567 890', role: 'Admin', joinedDate: '2024-01-15', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', status: 'active' },
  { id: '2', name: 'Mike Johnson', email: 'mike@example.com', phone: '+1 234 567 891', role: 'Member', joinedDate: '2024-02-20', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike', status: 'active' },
  { id: '3', name: 'Emma Wilson', email: 'emma@example.com', phone: '+1 234 567 892', role: 'Moderator', joinedDate: '2024-01-28', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma', status: 'active' },
  { id: '4', name: 'James Brown', email: 'james@example.com', phone: '+1 234 567 893', role: 'Member', joinedDate: '2024-03-10', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James', status: 'inactive' },
  { id: '5', name: 'Olivia Davis', email: 'olivia@example.com', phone: '+1 234 567 894', role: 'Member', joinedDate: '2024-02-05', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Olivia', status: 'active' },
];

const Members = () => {
  const [members, setMembers] = useState<Member[]>(mockMembers);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Member added successfully!');
    setIsAddModalOpen(false);
  };

  const handleDeleteMember = (id: string) => {
    setMembers(members.filter(m => m.id !== id));
    toast.success('Member removed');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2">Members</h1>
          <p className="text-muted-foreground">Manage your community members</p>
        </div>

        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-neon-cyan to-neon-indigo hover:opacity-90">
              <UserPlus className="w-4 h-4 mr-2" />
              Add Member
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card">
            <DialogHeader>
              <DialogTitle>Add New Member</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddMember} className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input placeholder="John Doe" required />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" placeholder="john@example.com" required />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input type="tel" placeholder="+1 234 567 890" />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <select className="w-full p-2 rounded-lg bg-background border border-border">
                  <option>Member</option>
                  <option>Moderator</option>
                  <option>Admin</option>
                </select>
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-neon-cyan to-neon-indigo">
                Add Member
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search Bar */}
      <Card className="glass-card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Members Table */}
      <Card className="glass-card p-6 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-4 px-4">Member</th>
              <th className="text-left py-4 px-4">Contact</th>
              <th className="text-left py-4 px-4">Role</th>
              <th className="text-left py-4 px-4">Status</th>
              <th className="text-left py-4 px-4">Joined</th>
              <th className="text-left py-4 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.map((member, index) => (
              <motion.tr
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border-b border-border/50 hover:bg-muted/50 transition-colors"
              >
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-10 h-10 rounded-full ring-2 ring-primary/20"
                    />
                    <span className="font-medium">{member.name}</span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{member.email}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{member.phone}</span>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-primary" />
                    <span>{member.role}</span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <Badge
                    variant={member.status === 'active' ? 'default' : 'secondary'}
                    className={member.status === 'active' ? 'bg-green-500/20 text-green-500' : ''}
                  >
                    {member.status}
                  </Badge>
                </td>
                <td className="py-4 px-4 text-muted-foreground">
                  {new Date(member.joinedDate).toLocaleDateString()}
                </td>
                <td className="py-4 px-4">
                  <button
                    onClick={() => handleDeleteMember(member.id)}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

export default Members;
