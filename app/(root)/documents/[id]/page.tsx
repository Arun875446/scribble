// import CollaborativeRoom from "@/components/CollaborativeRoom";
// import { getDocument } from "@/lib/actions/room.actions";
// import { getClerkUsers } from "@/lib/actions/user.actions";
// import { currentUser } from "@clerk/nextjs/server";
// import { redirect } from "next/navigation";

// const Document = async ({ params: { id } }: SearchParamProps) => {
//   const clerkUser = await currentUser();
//   if (!clerkUser) redirect("/sign-in");

//   const room = await getDocument({
//     roomId: id,
//     userId: clerkUser.emailAddresses[0].emailAddress,
//   });

//   if (!room) redirect("/");

//   const userIds = Object.keys(room.usersAccesses);
//   const users = await getClerkUsers({ userIds });

//   const usersData = users.map((user: User) => ({
//     ...user,
//     userType: room.usersAccesses[user.email]?.includes("room:write")
//       ? "editor"
//       : "viewer",
//   }));

//   const currentUserType = room.usersAccesses[
//     clerkUser.emailAddresses[0].emailAddress
//   ]?.includes("room:write")
//     ? "editor"
//     : "viewer";

//   return (
//     <main className="flex w-full flex-col items-center">
//       <CollaborativeRoom
//         roomId={id}
//         roomMetadata={room.metadata}
//         users={usersData}
//         currentUserType={currentUserType}
//       />
//     </main>
//   );
// };

// export default Document;
import CollaborativeRoom from "@/components/CollaborativeRoom";
import { getDocument } from "@/lib/actions/room.actions";
import { getClerkUsers } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const Document = async ({ params: { id } }: SearchParamProps) => {
  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/sign-in");

  const room = await getDocument({
    roomId: id,
    userId: clerkUser.emailAddresses[0].emailAddress,
  });

  if (!room) redirect("/");

  const userIds = Object.keys(room.usersAccesses || {});
  const users = await getClerkUsers({ userIds });

  // Debug: Log users array
  console.log("Users array:", users);

  const usersData = users.map((user: User) => {
    if (!user || !user.email) {
      // Handle cases where user or user.email is null or undefined
      console.error("Invalid user data:", user);
      return {
        ...user,
        userType: "viewer", // Default to viewer if email is missing
      };
    }

    const userEmail = user.email;
    const userAccesses = room.usersAccesses[userEmail] || [];
    return {
      ...user,
      userType: userAccesses.includes("room:write") ? "editor" : "viewer",
    };
  });

  const currentUserEmail = clerkUser.emailAddresses[0].emailAddress;
  const currentUserAccesses = room.usersAccesses[currentUserEmail] || [];
  const currentUserType = currentUserAccesses.includes("room:write")
    ? "editor"
    : "viewer";

  return (
    <main className="flex w-full flex-col items-center">
      <CollaborativeRoom
        roomId={id}
        roomMetadata={room.metadata}
        users={usersData}
        currentUserType={currentUserType}
      />
    </main>
  );
};

export default Document;
