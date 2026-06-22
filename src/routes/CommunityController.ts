import checkPostId from "../utils/checkPostId.ts";
import {Post} from "../generated/prisma/client.ts";
import {prisma} from "../../lib/prisma.ts";
import {Router} from "express";

const router = Router()


router.get('/', async (req, res) => {
    const communities = await prisma.community.findMany()
    res.status(200).send(communities)
})

router.get('/:name', async (req, res) => {
    const community = await prisma.community.findUnique({where: {name: req.params.name}})
    if (!community) {
        return res.status(404).send({message: "Сообщества с таким названием не существует"})
    }
    const posts = await prisma.post.findMany({where: {communityId: community.id}})
    const communityMember = community
    return res.status(200).send({community, posts})
})



export default router;