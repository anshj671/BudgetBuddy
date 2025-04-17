"use client"

import type React from "react"

import { useState } from "react"
import { XIcon, PlusIcon, TrashIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAppContext } from "@/lib/app-context"
import type { Group, User } from "@/lib/types"
import { useToast } from "@/components/ui/use-toast"

interface MemberManagementProps {
  group: Group
  onClose: () => void
}

export function MemberManagement({ group, onClose }: MemberManagementProps) {
  const { updateGroup, isLoading } = useAppContext()
  const { toast } = useToast()
  const [members, setMembers] = useState<User[]>(group.members)
  const [newMemberEmail, setNewMemberEmail] = useState("")

  const handleAddMember = () => {
    if (!newMemberEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      })
      return
    }

    // Check if member already exists
    if (members.some((m) => m.email.toLowerCase() === newMemberEmail.toLowerCase())) {
      toast({
        title: "Error",
        description: "This member is already in the group",
        variant: "destructive",
      })
      return
    }

    // In a real app, you'd search for the user in your database
    // For this demo, we'll create a mock user
    const newMember: User = {
      id: `user-${Date.now()}`,
      name: newMemberEmail.split("@")[0], // Use part of email as name
      email: newMemberEmail,
      avatar: "/placeholder.svg?height=40&width=40",
    }

    setMembers([...members, newMember])
    setNewMemberEmail("")

    toast({
      title: "Member added",
      description: `${newMember.name} has been added to the group`,
    })
  }

  const handleRemoveMember = (memberId: string) => {
    // Don't allow removing yourself
    if (memberId === "user-1") {
      toast({
        title: "Error",
        description: "You cannot remove yourself from the group",
        variant: "destructive",
      })
      return
    }

    // Don't allow removing the last member
    if (members.length <= 1) {
      toast({
        title: "Error",
        description: "A group must have at least one member",
        variant: "destructive",
      })
      return
    }

    setMembers(members.filter((m) => m.id !== memberId))

    toast({
      title: "Member removed",
      description: "Member has been removed from the group",
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    updateGroup(group.id, {
      members,
    })

    onClose()
  }

  return (
    <Card className="fixed inset-0 z-50 m-auto h-fit max-h-[90vh] w-full max-w-md overflow-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Manage Members</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <XIcon className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Current Members</Label>
            <div className="space-y-2">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between rounded-md border p-2">
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveMember(member.id)}
                    disabled={member.id === "user-1"} // Can't remove yourself
                  >
                    <TrashIcon className="h-4 w-4" />
                    <span className="sr-only">Remove</span>
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newMember">Add Member</Label>
            <div className="flex space-x-2">
              <Input
                id="newMember"
                placeholder="Email address"
                type="email"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
              />
              <Button type="button" onClick={handleAddMember}>
                <PlusIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

