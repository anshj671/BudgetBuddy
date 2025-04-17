"use client"

import { useState } from "react"
import { PlusIcon, SearchIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { GroupForm } from "@/components/group-form"
import { useAppContext } from "@/lib/app-context"

export default function GroupsPage() {
  const { groups } = useAppContext()
  const [showGroupForm, setShowGroupForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  const filteredGroups = groups.filter((group) => group.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between space-y-2 md:flex-row md:items-center md:space-y-0">
        <h2 className="text-3xl font-bold tracking-tight">Groups</h2>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search groups..."
              className="w-full pl-8 md:w-[200px] lg:w-[300px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={() => setShowGroupForm(true)}>
            <PlusIcon className="mr-2 h-4 w-4" />
            New Group
          </Button>
        </div>
      </div>

      {showGroupForm && <GroupForm onClose={() => setShowGroupForm(false)} />}

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Groups</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="settled">Settled</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredGroups.map((group) => (
              <Card key={group.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle>{group.name}</CardTitle>
                    <Badge variant={group.isSettled ? "secondary" : "default"}>
                      {group.isSettled ? "Settled" : "Active"}
                    </Badge>
                  </div>
                  <CardDescription>{group.description}</CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex -space-x-2 overflow-hidden">
                    {group.members.map((member, index) => (
                      <Avatar key={index} className="border-2 border-background">
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-sm">
                      <span>Total expenses: ${group.totalExpenses.toFixed(2)}</span>
                      <span>Your share: ${group.yourShare.toFixed(2)}</span>
                    </div>
                    <Progress value={(group.yourShare / group.totalExpenses) * 100} className="mt-2" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" onClick={() => router.push(`/groups/${group.id}`)}>
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredGroups
              .filter((group) => !group.isSettled)
              .map((group) => (
                <Card key={group.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle>{group.name}</CardTitle>
                      <Badge>Active</Badge>
                    </div>
                    <CardDescription>{group.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex -space-x-2 overflow-hidden">
                      {group.members.map((member, index) => (
                        <Avatar key={index} className="border-2 border-background">
                          <AvatarImage src={member.avatar} alt={member.name} />
                          <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                    <div className="mt-4">
                      <div className="flex justify-between text-sm">
                        <span>Total expenses: ${group.totalExpenses.toFixed(2)}</span>
                        <span>Your share: ${group.yourShare.toFixed(2)}</span>
                      </div>
                      <Progress value={(group.yourShare / group.totalExpenses) * 100} className="mt-2" />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" onClick={() => router.push(`/groups/${group.id}`)}>
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="settled" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredGroups
              .filter((group) => group.isSettled)
              .map((group) => (
                <Card key={group.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle>{group.name}</CardTitle>
                      <Badge variant="secondary">Settled</Badge>
                    </div>
                    <CardDescription>{group.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex -space-x-2 overflow-hidden">
                      {group.members.map((member, index) => (
                        <Avatar key={index} className="border-2 border-background">
                          <AvatarImage src={member.avatar} alt={member.name} />
                          <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                    <div className="mt-4">
                      <div className="flex justify-between text-sm">
                        <span>Total expenses: ${group.totalExpenses.toFixed(2)}</span>
                        <span>Your share: ${group.yourShare.toFixed(2)}</span>
                      </div>
                      <Progress value={100} className="mt-2" />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" onClick={() => router.push(`/groups/${group.id}`)}>
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

